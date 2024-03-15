#version 120

uniform vec2 resolution;
uniform float time;

// Create a "bump" with two smoothstep functions, centered at `center` and with thickness `thickness`. Returns the value of the bump at `v`
float bump(float v, float center, float thickness) {
  return smoothstep(center-thickness, center, v) - smoothstep(center, center+thickness, v);
}

/// Get brightness of a line at a given y position
float plot(vec2 uv, float y, float w){
  return bump(uv.y, y, w);
}

float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

float sin01(float x) {
  return sin(x)*0.5+0.5;
}

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main()
{
  vec2 uv = gl_FragCoord.xy/resolution.y;
  vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
  // A horizontal line
  float y = 0.5;
  // Step function
  y = step(aspect.x/2, uv.x);
  // Smoothstep function
  // y = smoothstep(0.1, 0.9, uv.x);
  // A bump (same as 'bump function')
  // y = smoothstep(0.2, 0.5,uv.x)-smoothstep(0.5, 0.8, uv.x);
  // A sine wave
  // y = 0.5+sin(uv.x*10 + time*2)*0.5;
  //float y = step(0.5,uv.x);
//    uv = normalize(vec2(-uv.y*sin(time),
//                        uv.x*cos(time))*0.5 + 0.5);
//    gl_FragColor = vec4(uv.x, uv.y, 1.0, 1.0);
//
//
  float v = plot(uv*aspect, y, 0.01);
  
  ////////////////////////////////
  // Example using 2d SDFs
//  float v = 0.0;
//  vec2 space = aspect/24;
//  float r = space.y*0.3;
//  v += sdCircle(mod(uv, space)-space*0.5, r);
//  v = smoothstep(0.0, 0.01, v);
  ///////////////////////////////
  
  gl_FragColor = vec4(v, v, v, 1.0);
}

