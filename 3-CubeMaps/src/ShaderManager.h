//
//  ShaderManager.hpp
//  multilight
//
//  Created by Leo on 10/12/16.
//
//

#pragma once

#include "ofxShadersFX_LightingShader.h"
#include "ofxCubeMap.h"

class ShaderManager : public ofxShadersFX::Lighting::LightingShader{

public:
    void load(string shaderName);
    
    void begin();
    void end();
    void reload();
    
    void drawCubeMapEnvironment(float size);

    void toggleLight(ofLight * p_light, bool state);
    void toggleTexture(ofImage * p_img);
    
    void useNormalMapTexture(ofImage * p_img);
    void useCubeMap(ofxCubeMap* p_cubemap){m_cubemap = p_cubemap;}
    
    string shaderName(){return _shaderName;}
    
private:
    
    bool usingLight(ofLight* p_light);
    string _shaderName;
    
    ofImage * m_normTex;
    ofxCubeMap * m_cubemap;
    
};