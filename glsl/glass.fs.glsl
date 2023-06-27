/*
Uniforms already defined by THREE.js
------------------------------------------------------
uniform mat4 viewMatrix; = camera.matrixWorldInverse
uniform vec3 cameraPosition; = camera position in world space
------------------------------------------------------
*/

uniform sampler2D textureMask; //Texture mask, color is different depending on whether this mask is white or black.
uniform samplerCube cubeMap;
uniform sampler2D textureNumberMask; //Texture containing the billard ball's number, the final color should be black when this mask is black.
uniform vec3 maskLightColor; //Ambient/Diffuse/Specular Color when textureMask is white
uniform vec3 materialDiffuseColor; //Diffuse color when textureMask is black (You can assume this is the default color when you are not using textures)
uniform vec3 materialSpecularColor; //Specular color when textureMask is black (You can assume this is the default color when you are not using textures)
uniform vec3 materialAmbientColor; //Ambient color when textureMask is black (You can assume this is the default color when you are not using textures)
uniform float shininess; //Shininess factor
uniform vec3 cameraPos;
uniform vec3 lightDirection; //Direction of directional light in world space
uniform vec3 lightColor; //Color of directional light
uniform vec3 ambientLightColor; //Color of ambient light
in vec4 relativeVertexPosition;
in vec3 modelViewNormal;
in vec2 UV;
in vec3 reflectedVector;
in vec3 refractedVector;



void main() {
	vec3 modelViewLight = vec3(viewMatrix * vec4(lightDirection, 0.0));

	vec3 n = normalize(modelViewNormal);
	vec3 l = normalize(-modelViewLight);
	vec3 r = reflect(l, n); //reflection
	vec3 v = normalize(vec3(relativeVertexPosition));

	// (n * l)
	float diffuse = max(dot(n, l), 0.0);

	// (r * v)^n
	float specular = pow(max(dot(r, v), 0.0),shininess);

	vec3 ambiantColor = mix(materialAmbientColor,maskLightColor,vec3(texture2D(textureMask, UV)));
	vec3 diffuseColor = mix(materialDiffuseColor,maskLightColor,vec3(texture2D(textureMask, UV)));
	vec3 specularColor = mix(materialSpecularColor,maskLightColor,vec3(texture2D(textureMask, UV)));

	// I = Ia*Ka + Ip * (Kd * (n*l) + Ks * (r * v)^n)
	vec3 vertexColorPhong = ambiantColor*ambientLightColor  + lightColor * ( diffuseColor*diffuse +  specularColor*specular ) *vec3(texture2D(textureNumberMask, UV));


	vec3 reflectedColor = vec3(textureCube(cubeMap,reflectedVector));
	vec3 refractedColor = vec3(textureCube(cubeMap,refractedVector));
	vec3 crystal = mix(reflectedColor,refractedColor,0.7); //jouer avec la valeur de 0.7 ici pour choisir entre la reflection ou la refraction

	vec3 vertexColor = mix(vertexColorPhong, crystal,0.8);

	//gl_FragColor = vec4(vertexColor, 1.0);
	gl_FragColor = vec4(vertexColor, 1.0);;

}