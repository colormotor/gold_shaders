#pragma once

#include "ofMain.h"
#include "ofShader.h"

class ofApp : public ofBaseApp{

    
	public:
		void setup() override;
		void update() override;
		void draw() override;
		void exit() override;
  
		void keyPressed(int key) override;
  
    void loadShader();
    
    ofShader shader;
};
