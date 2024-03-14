#include "ofApp.h"

void ofApp::setup(){
  loadShader();
  fmonitor.addFile("vertex.vert");
  fmonitor.addFile("fragment.frag");
}

void ofApp::update(){
  if (fmonitor.changed())
    loadShader();
}

void ofApp::draw(){
  ofSetColor(255);
  // We just use the cam to compute the relevant transformations, and pass these on to the shader
  cam.begin();
  //ofDrawBox(0, 0, 0, 100);
  cam.end();
  
  // Rendering happens here
  shader.begin();
  shader.setUniform2f("resolution", ofGetWidth(), ofGetHeight());
  shader.setUniform1f("time", ofGetElapsedTimef());
  shader.setUniformMatrix4f("invViewMatrix", glm::inverse(cam.getModelViewMatrix()));
  shader.setUniform1f("farClip", cam.getFarClip());
  shader.setUniform1f("tanHalfFov", tan(0.5*ofDegToRad(cam.getFov())));
  ofDrawRectangle(0, 0, ofGetWidth(), ofGetHeight());
  shader.end();
}

void ofApp::exit(){
}

void ofApp::keyPressed(int key){
  if (key == ' ')
    loadShader();
}

void ofApp::loadShader() {
  cout << "Shader reloaded" << endl;
  shader.load("vertex.vert", "fragment.frag");
}

