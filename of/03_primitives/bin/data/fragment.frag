#version 120

uniform float windowWidth;
uniform float windowHeight;
uniform float time;

float plot(vec2 st, float pct){
  float w = 0.5;
  return  smoothstep( pct-w, pct, st.y) -
          smoothstep( pct, pct+w, st.y);
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
  vec2 uv = gl_FragCoord.xy/windowHeight;
  vec2 aspect = vec2(windowWidth/windowHeight, 1.0);
  float y = 0.5;
//  float y = smoothstep(0.2, 0.5,uv.x)-smoothstep(0.5, 0.8, uv.x);
  y = 0.5+sin(uv.x*10 + time*2)*0.5;
  //float y = step(0.5,uv.x);
//    uv = normalize(vec2(-uv.y*sin(time),
//                        uv.x*cos(time))*0.5 + 0.5);
//    gl_FragColor = vec4(uv.x, uv.y, 1.0, 1.0);
//
//
  float v = 0.0; //plot(uv, y);
  vec2 space = aspect/24 ;
  float r = length(aspect/2 - uv)*0.01 + sin01(uv.x*4 + time*3)*0.01 - sin01(uv.y*5 + time*2 + 0.1)*0.02 + random(floor(uv*24+0.5))*0.01;
  v += sdCircle(mod(uv, space)-space*0.5, r);
  v = smoothstep(0.0, 0.01, v);
  gl_FragColor = vec4(v, v, v, 1.0);
}

