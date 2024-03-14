#include "ofApp.h"

void ofApp::setup(){
  ofDisableArbTex(); // This is important for the shader to work
  vin.setup(ofGetWidth(), ofGetHeight());
  loadShader();
  fmonitor.addFile("vertex.vert");
  fmonitor.addFile("fragment.frag");
}

void ofApp::update(){
  vin.update();
  if (fmonitor.changed())
    loadShader();
}

void ofApp::draw(){
  ofSetColor(255);

  vin.getTexture().bind();
  shader.begin();
  shader.setUniform2f("resolution", vin.getWidth(), vin.getHeight());
  shader.setUniform1f("time", ofGetElapsedTimef());
  vin.getTexture().draw(0, 0, ofGetWidth(), ofGetHeight());
  shader.end();
  vin.getTexture().unbind();
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

