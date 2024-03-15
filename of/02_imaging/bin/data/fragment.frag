#version 120
//#define BOXRADIUS 15

uniform float time;
uniform vec2 resolution;

// Received from vertex shader
varying vec2 texCoord;

// The texture we can sample
uniform sampler2D tex0;
// NOTE: Openframeworks uses "Rect" texture samplers by default, which does not user the standard [0,1] and resolution independent way to sample textures. To use this instead we will need to call `ofDisableArbTex()` in ofApp::setup.

/// Box blur
vec4 boxBlur(in vec2 uv, const int size)
{
    int window = size*2+1;
    vec4 accum = vec4(0);
    float sum = 0.0;
    for (int i = -size; i <= size; i++)
      for (int j = -size; j <= size; j++)
      {
        float w = 1.0;
        sum += w;
        accum += texture2D(tex0, uv+vec2(j,i)/resolution)*w;
      }
    
    return accum/sum;
}

/// Gaussian blur
float normpdf(in float x, in float sigma)
{
  return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;
}

// Bit faster Gaussian blur (still slow) with fixed size
vec4 gaussBlur(in vec2 uv)
{
  const int size = 25;
  const int window = size*2+1;
    float sigma = window/5;
  float kernel1d[window];
    for (int i = 0; i <= size; i++)
        kernel1d[size+i] = kernel1d[size-i] = normpdf(float(i), sigma);
  
    vec4 accum = vec4(0);
    float sum = 0.0;
    for (int i = -size; i <= size; i++)
      for (int j = -size; j <= size; j++)
      {
        float w = kernel1d[size+i]*kernel1d[size+j];
        sum += w;
        accum += texture2D(tex0, uv+vec2(j,i)/resolution)*w;
      }
    
    return accum/sum;
}

// Slow Gaussian blur with input blur size
vec4 gaussBlurSlow(in vec2 uv, const int size)
{
    int window = size*2+1;
    float sigma = window/5;
    
    vec4 accum = vec4(0);
    float sum = 0.0;
    for (int i = -size; i <= size; i++)
      for (int j = -size; j <= size; j++)
      {
        float w = normpdf(i, sigma)*normpdf(j, sigma);
        sum += w;
        accum += texture2D(tex0, uv+vec2(j,i)/resolution)*w;
      }
    
    return accum/sum;
}

// Threshold the input
vec4 threshold(in vec2 uv, in float thresh)
{
    vec4 clr = texture2D(tex0, uv);
    float l = (clr.x + clr.y + clr.z)/3;
    l = step(thresh, l); // hard threshold
//    l = smoothstep(max(0.0, thresh-0.2), thresh, l); // smooth threshold
    return vec4(l, l, l, 1.0);
}

// Creates random vertical columns
float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec4 randomColumns(in vec2 uv, in int num)
{
  float x = random(vec2(floor(uv.x*num)));
  vec2 uvLines = vec2(x + fract(uv.x*num)/num, uv.y);
  vec4 clr = texture2D(tex0, uvLines);
  return clr;
}

void main()
{
  vec2 uv = texCoord;
  //gl_FragColor = boxBlur(uv, 15);
  //gl_FragColor = gaussBlur(uv);
  //gl_FragColor = gaussBlurSlow(uv, 15);
  gl_FragColor = threshold(uv, 0.5);
  //gl_FragColor = randomColumns(uv, 5);
  //gl_FragColor = vec4(uv.x, uv.y, 0.0, 1.0);
}
