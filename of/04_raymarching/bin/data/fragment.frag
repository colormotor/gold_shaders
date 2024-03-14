#version 120

uniform vec2 resolution;
uniform float time;
uniform mat4 invViewMatrix;
uniform float tanHalfFov;
uniform float farClip;

const float EPSILON = 0.001;
const float PI = 3.1415926535;
const float PI2 = PI*2.0;

// Modify these functions
float computeScene( in vec3 p, out int mtl );
vec4 computeColor( in vec3 p, in float distance, in int mtl );

//////////////////////////////////
// from iq. https://www.shadertoy.com/view/Xds3zN
vec3 calcNormal ( in vec3 p )
{
    vec3 delta = vec3( 0.004, 0.0, 0.0 );
    int mtl;
    vec3 n;
    n.x = computeScene( p+delta.xyz, mtl ) - computeScene( p-delta.xyz, mtl );
    n.y = computeScene( p+delta.yxz, mtl ) - computeScene( p-delta.yxz, mtl );
    n.z = computeScene( p+delta.yzx, mtl ) - computeScene( p-delta.yzx, mtl );
    return normalize( n );
}

//float ambientOcclusion( in vec3 pos, in vec3 nor )
//{
//    float occ = 0.0;
//    float sca = 1.0;
//    int mtl;
//    for( int i=0; i<5; i++ )
//    {
//        float hr = 2.01 + 4.12*float(i)/4.0;
//        vec3 aopos =  nor * hr + pos;
//        float dd = computeScene( aopos, mtl );
//        occ += -(dd-hr)*sca;
//        sca *= 0.95;
//    }
//    return clamp( 1.0 - 3.0*occ, 0.0, 1.0 );
//}

////---------------------------------------------------
//float ambientOcclusion( in vec3 p, in vec3 n )
//{
//    float ao = 0.0;
//    float weight = 1.9;
//    int mtl;
//
//    for ( int i = 1; i < 6; ++i )
//    {
//        float delta = i*i*EPSILON*100.0;
//        ao += weight * (delta-computeScene(p+n*(0.0+delta), mtl));
//        weight *= 0.5;
//    }
//
//    return 1.0-clamp(ao, 0.0, 1.0);
//}
//

float ambientOcclusion( in vec3 pos, in vec3 nor )
{
    float occ = 0.0;
    float sca = 1.0;
    int mtl = 0;
    for( int i=0; i<10; i++ )
    {
        float r = 0.01 + 3.3*float(i);
        vec3 aopos =  nor * r + pos;
        float d = computeScene( aopos, mtl );
        occ += (r - d)*sca;
       /* if(d < 0.01)
            break;*/
        sca *= 0.75;
    }
    return clamp( 1.0 - occ / 50.14, 0.0, 1.0 );
}


////////////////////////////////
// CSG
float sdfUnion(in float d1, in float d2)
{
    return min(d1, d2);
}

float sdfSubtract(in float d1, in float d2)
{
    return max(-d2, d1);
}

float sdfIntersect(in float d1, in float d2)
{
    return max(d1, d2);
}


//// Smooth blend functions
////  http://www.iquilezles.org/www/articles/smin/smin.htm
float sminExp( float a, float b, float k )
{
    float res = exp( -k*a ) + exp( -k*b );
    return -log( res )/k;
}

float sminPoly( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}


// power smooth min (k = 8);
float sminPower( float a, float b, float k )
{
    a = pow( a, k ); b = pow( b, k );
    return pow( (a*b)/(a+b), 1.0/k );
}

float sdfBlendExp( in float d1, in float d2, in float k )
{
    return sminExp(d1, d2, k);
}

float sdfBlendPoly( in float d1, in float d2, in float k )
{
    return sminPoly(d1, d2, k);
}

float sdfBlendPower( in float d1, in float d2, in float k )
{
    return sminPower(d1, d2, k);
}

/// Transform
vec3 sdfRepeat( in vec3 p, in vec3 rep)
{
    vec3 d = mod(p, rep) - 0.5*rep;
    return d;
}

vec3 sdfTranslate( in vec3 p, in vec3 offset )
{
    return p-offset;
}

vec3 sdfRotateY(in vec3 p, float theta)
{
    float c = cos(theta);
    float s = sin(theta);
    vec3 res;
    res.x = p.x * c - p.z * s;
    res.y = p.y;
    res.z = p.x * s + p.z * c;
    return res;
}

vec3 sdfRotateX(in vec3 p, float theta)
{
    float c = cos(theta);
    float s = sin(theta);
    vec3 res;
    res.x = p.x;
    res.y = p.y * c - p.z * s;
    res.z = p.y * s + p.z * c;
    return res;
}

vec3 sdfRotateZ(in vec3 p, float theta)
{
    float c = cos(theta);
    float s = sin(theta);
    vec3 res;
    res.x = p.x * c - p.y * s;
    res.y = p.x * s + p.y * c;
    res.z = p.z;
    return res;
}

//////////////
// Primitives
float sdfBox(in vec3 p, in vec3 size)
{
    vec3 d = abs(p) - size*0.5;
    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdfSphere(in vec3 p, in float radius)
{
    return length(p)-radius;
}

float sdfTorus(in vec3 p, in float radius, in float thickness )
{
    vec2 q = vec2(length(p.xz)-radius,p.y);
    return length(q)-thickness;
}

float sdfPlane( vec3 p, vec3 n, float h )
{
  // n must be normalized
  return dot(p,n) + h;
}

///////////////
// Ray marcher
vec4 traceRay(in vec3 p, in vec3 w, in vec4 bgClr, inout float distance)
{
    const int maxIterations = 128;
  const float closeEnough = EPSILON;
    vec3 rp;
    int mtl;
    float t = 0;
    for (int i = 0; i < maxIterations; ++i)
    {
        rp = p+w*t;
        float d = computeScene(rp, mtl);
        if (d < t*closeEnough)
        {
            distance = t;
            // use this to debug number of ray casts
            //return vec3(float(i)/128.0);
            vec4 clr = computeColor(rp, t, mtl);
            // apply fog
            float amt = 1.0 - exp(-t/(farClip*0.8));
            clr.xyz = mix(clr.xyz, bgClr.xyz, amt);
            return clr;
        }
        else if(t > distance)
        {
            return bgClr;
        }
        t += d;
    }
    
    return bgClr;
}


void main()
{
  vec2 xy = gl_FragCoord.xy; ///resolution;
  // Primary ray origin
  vec3 p = invViewMatrix[3].xyz;
  // Primary ray direction
  vec3 w = mat3(invViewMatrix) * normalize(
                                           vec3( (xy - resolution / 2.0)*vec2(1.0,1.0), resolution.y/(-2.0*tanHalfFov))
                                           );
  
  float distance = 1e10;
  
  vec4 clr = traceRay(p, w, vec4(0.0, 0.0, 0.0, 1.0), distance);
  gl_FragColor = clr;
}

vec4 computeColor( in vec3 p, in float distance, in int mtl )
{
  vec3 clr = vec3(1.0); // ambient
  vec3 n = calcNormal(p);
  // normal visualization
  //clr *= n*0.5+0.5;
  //return vec4(clr, 1.0);
  // DIffuse light
  float l = max(0.3, dot(n, normalize(vec3(50.0, 100.0, 30.0))));
  float ao = ambientOcclusion(p, n)*1.0;
  l *= ao;
  return vec4(clr*l, 1.0);
}

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float computeScene( in vec3 p, out int mtl )
{
  mtl = 0;
  float d = 1e10;
  
  //p = sdfRotateX(p, time*0.03);
  //p = sdfRepeat(p, vec3(200.0, 400.0, 200.0));
  //p = sdfRotateX(p, -time*4.3);
  //d = sdfUnion(d, sdfBox(p, vec3(100.0)));
  for (int i = 0; i < 5; i++) {
    vec3 pos = (0.5-vec3(random(vec2(0.0, float(i))),
                    random(vec2(1.0, float(i))),
                    random(vec2(2.0, float(i)))))*100;
    
    d = sdfUnion(d, sdfBox(
                           sdfTranslate(p, pos), vec3(100.0)));
  }
  //d = sdfUnion(d, sdfTorus(p, 150.0, 90.0));
  d = sdfUnion(d, sdfPlane(p, vec3(0.0, 1.0, 0.0), 130.0));
  return d;
}
