#version 120

varying vec2 texCoord;

void main(){
  // Pass the texture coordinates to the fragment shader
  // through a "varying" variabl
  texCoord = gl_MultiTexCoord0.xy;
  // Set the transformed and projected position
  gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
