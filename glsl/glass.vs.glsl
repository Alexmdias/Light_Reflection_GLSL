/*
Uniforms already defined by THREE.js
------------------------------------------------------
uniform mat4 modelMatrix; = object.matrixWorld
uniform mat4 modelViewMatrix; = camera.matrixWorldInverse * object.matrixWorld
uniform mat4 projectionMatrix; = camera.projectionMatrix
uniform mat4 viewMatrix; = camera.matrixWorldInverse
uniform mat3 normalMatrix; = inverse transpose of modelViewMatrix
uniform vec3 cameraPosition; = camera position in world space
attribute vec3 position; = position of vertex in local space
attribute vec3 normal; = direction of normal in local space
attribute vec2 uv; = uv coordinates of current vertex relative to texture coordinates
------------------------------------------------------
*/

//Custom defined Uniforms for TP3
uniform sampler2D textureMask; //Texture mask, color is different depending on whether this mask is white or black.
uniform sampler2D textureNumberMask; //Texture containing the billard ball's number, the final color should be black when this mask is black.
uniform vec3 maskLightColor; //Ambient/Diffuse/Specular Color when textureMask is white
uniform vec3 materialDiffuseColor; //Diffuse color when textureMask is black (You can assume this is the default color when you are not using textures)
uniform vec3 materialSpecularColor; //Specular color when textureMask is black (You can assume this is the default color when you are not using textures)
uniform vec3 materialAmbientColor; //Ambient color when textureMask is black (You can assume this is the default color when you are not using textures)
uniform float shininess; //Shininess factor

uniform vec3 lightDirection; //Direction of directional light in world space
uniform vec3 lightColor; //Color of directional light
uniform vec3 ambientLightColor; //Color of ambient light
out vec4 relativeVertexPosition;
out vec3 modelViewNormal;
out vec2 UV;
out vec3 reflectedVector;
out vec3 refractedVector;


void main() {

    UV = uv;

    relativeVertexPosition = modelViewMatrix * vec4(position, 1.0);
    modelViewNormal = vec3(modelViewMatrix * vec4(normal, 0.0));

    vec3 viewVector = normalize(vec3(relativeVertexPosition)-cameraPosition);
    reflectedVector = reflect(viewVector, modelViewNormal); //normalize(normal)?
    refractedVector = refract(viewVector, modelViewNormal, 1.0/1.33);
    gl_Position = projectionMatrix * relativeVertexPosition;
}