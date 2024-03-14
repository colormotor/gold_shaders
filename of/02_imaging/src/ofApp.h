#pragma once

#include "ofMain.h"
#include "ofShader.h"

class FilesChangedMonitor {
  /// Barbones object that keeps track of files to see if they have been modified
public:
  typedef std::filesystem::file_time_type file_time;
  
  FilesChangedMonitor() {
  }
  
  /// Adds a file to be monitored (assumed to be relative to data folder)
  void addFile(const std::string& path) {
    paths.push_back(ofToDataPath(path));
    changeTimes.push_back(std::filesystem::last_write_time(paths.back()));
  }
  
  /// Returns true if one or more files have been modified
  bool changed() {
    bool res = false;
    for (int i = 0; i < paths.size(); i++) {
      file_time t = std::filesystem::last_write_time(paths[i]);
      if (t != changeTimes[i]) {
        res = true;
        changeTimes[i] = t;
      }
    }
    return res;
  }

private:
  std::vector<file_time> changeTimes;
  std::vector<std::filesystem::path> paths;
};

class ofApp : public ofBaseApp{
	public:
		void setup() override;
		void update() override;
		void draw() override;
		void exit() override;
  
		void keyPressed(int key) override;
  
    void loadShader();
    
    ofShader shader;
    FilesChangedMonitor fmonitor;
    ofVideoGrabber vin;
};
