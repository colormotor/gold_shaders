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
  shader.begin();
  shader.setUniform1f("windowWidth", ofGetWidth());
  shader.setUniform1f("windowHeight", ofGetHeight());
  shader.setUniform1f("time", ofGetElapsedTimef());
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

