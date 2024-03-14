#include "ofApp.h"



//--------------------------------------------------------------
void ofApp::setup(){

  loadShader();
}

//--------------------------------------------------------------
void ofApp::update(){

}

//--------------------------------------------------------------
void ofApp::draw(){
  ofSetColor(255);
  shader.begin();
  ofDrawRectangle(0, 0, ofGetWidth(), ofGetHeight());
  shader.end();
}

//--------------------------------------------------------------
void ofApp::exit(){

}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){
  if (key == ' ')
    loadShader();
}

void ofApp::loadShader() {
  shader.load("vertex.vert", "fragment.frag");
}

