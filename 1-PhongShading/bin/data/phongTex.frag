

// The MIT License (MIT)
// Copyright (c) 2016 Alexandre Baron (Scylardor)

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


#version 330

#pragma include "lights.glsl"
#pragma include "material.glsl"

uniform mat4 modelViewProjectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform sampler2DRect tex;
uniform int lightsNumber;

in vec2 varyingtexcoord;
in vec4 v_eye, ambientGlobal;
in vec3 v_normal;

out vec4 fragColor;

vec4 directional_light( in int lightIndex, in vec3 normal) {
    vec4 outputColor = vec4(0.0);
    vec3 lightDir;
    vec4 diffuse, ambient, specular = vec4(0.0);
    float intensity;

    lightDir = normalize(lights.light[lightIndex].position.xyz);
    ambient = material.ambient * lights.light[lightIndex].ambient * texture(tex, varyingtexcoord);
    outputColor = ambient;
    intensity = max(dot(normal, lightDir), 0.0);
    if (intensity > 0.0) {
        vec3 reflection;
        vec3 v_eye_n = normalize(vec3(v_eye));
        vec3 eyeVector = normalize(-v_eye_n);

        diffuse = lights.light[lightIndex].diffuse * material.diffuse;
        outputColor += diffuse * intensity * texture(tex, varyingtexcoord);
        reflection = normalize((2.0 * dot(lightDir, normal) * normal) - lightDir);
        specular = pow(max(dot(reflection, eyeVector), 0.0), material.shininess) * material.specular * lights.light[lightIndex].specular;
        outputColor += specular;
    }
    outputColor.w = 1.0;
    return outputColor;
}

vec4 point_light( in int lightIndex, in vec3 normal) {
    vec3 lightDir;
    vec4 pointLightColor;
    float intensity, dist;

    pointLightColor = vec4(0.0);
    lightDir = vec3(lights.light[lightIndex].position - v_eye);
    dist = length(lightDir);
    intensity = max(dot(normal, normalize(lightDir)), 0.0);
    if (intensity > 0.0) {
        float att;
        vec4 diffuse, specular, ambient = vec4(0.0);
        vec3 reflection;
        vec3 v_eye_n = normalize(vec3(v_eye));
        vec3 eyeVector = normalize(-v_eye_n);

        att = 1.0 / (lights.light[lightIndex].constant_attenuation + lights.light[lightIndex].linear_attenuation * dist + lights.light[lightIndex].quadratic_attenuation * dist * dist);
        diffuse = material.diffuse * lights.light[lightIndex].diffuse * texture(tex, varyingtexcoord);
        ambient = material.ambient * lights.light[lightIndex].ambient * texture(tex, varyingtexcoord);
        pointLightColor += att * (diffuse * intensity + ambient);
        reflection = normalize((2.0 * dot(lightDir, normal) * normal) - lightDir);
        specular = pow(max(dot(reflection, eyeVector), 0.0), material.shininess) * material.specular * lights.light[lightIndex].specular;
        pointLightColor += att * specular;
    }
    return pointLightColor;
}

vec4 spot_light( in int lightIndex, in vec3 normal) {
    vec3 lightDir;
    vec4 spotLightColor;
    float intensity, dist;

    spotLightColor = vec4(0.0);
    lightDir = vec3(lights.light[lightIndex].position - v_eye);
    dist = length(lightDir);
    intensity = max(dot(normal, normalize(lightDir)), 0.0);
    if (intensity > 0.0) {
        float spotEffect, att;
        vec4 diffuse, specular, ambient = vec4(0.0);
        vec3 reflection;
        vec3 v_eye_n = normalize(vec3(v_eye));
        vec3 eyeVector = normalize(-v_eye_n);

        spotEffect = dot(normalize(lights.light[lightIndex].spot_direction), normalize(-lightDir));
        if (spotEffect > lights.light[lightIndex].spot_cos_cutoff) {
            spotEffect = pow(spotEffect, lights.light[lightIndex].spot_exponent);
            att = spotEffect / (lights.light[lightIndex].constant_attenuation + lights.light[lightIndex].linear_attenuation * dist + lights.light[lightIndex].quadratic_attenuation * dist * dist);
            diffuse = material.diffuse * lights.light[lightIndex].diffuse * texture(tex, varyingtexcoord);
            ambient = material.ambient * lights.light[lightIndex].ambient * texture(tex, varyingtexcoord);
            spotLightColor += att * (diffuse * intensity + ambient);
            reflection = normalize((2.0 * dot(lightDir, normal) * normal) - lightDir);
            specular = pow(max(dot(reflection, eyeVector), 0.0), material.shininess) * material.specular * lights.light[lightIndex].specular;
            spotLightColor += att * specular;
        }
    }
    return spotLightColor;
}

vec4 calc_lighting_color( in vec3 normal) {
    vec4 lightingColor = vec4(0.0);

    for (int i = 0; i < lightsNumber; i++) {
        if (lights.light[i].position.w == 0.0) {
            lightingColor += directional_light(i, normal);
        } else {
            if (lights.light[i].spot_cutoff <= 90.0) {
                lightingColor += spot_light(i, normal);
            } else {
                lightingColor += point_light(i, normal);
            }
        }
    }
    return lightingColor;
}

void main() {
    
    fragColor = material.emission * texture(tex, varyingtexcoord);
    
    fragColor += calc_lighting_color(v_normal);
    fragColor.w = 1.0;
    
}
