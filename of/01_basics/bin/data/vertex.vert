#version 150

uniform mat4 modelViewProjectionMatrix;
in vec4 position;

void main(){
    gl_Position = gl_ModelViewProjectionMatrix *
                  gl_Vertex;
}
