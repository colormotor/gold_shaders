#include "ofMain.h"
#include "ofApp.h"

//========================================================================
int main( ){
#ifdef OF_TARGET_OPENGLES
  ofGLESWindowSettings settings;
  settings.glesVersion=2;
#else
  ofGLWindowSettings settings;
  //settings.setGLVersion(3,2); // uncomment to run with GL 3 and GLSL 1.5
#endif

  settings.setSize(1024, 768);
  settings.windowMode = OF_WINDOW; //can also be OF_FULLSCREEN

  auto window = ofCreateWindow(settings);

  ofRunApp(window, make_shared<ofApp>());
  ofRunMainLoop();
}
