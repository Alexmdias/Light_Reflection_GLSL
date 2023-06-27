/*
Uniforms already defined by THREE.js
------------------------------------------------------
uniform mat4 viewMatrix; = camera.matrixWorldInverse
uniform vec3 cameraPosition; = camera position in world space
------------------------------------------------------
*/

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
in vec4 relativeVertexPosition;
in vec3 modelViewNormal;
in vec3 viewDirection;
in vec2 UV;
void main() {
	
	// dp, c'est la distance utilisé plus tard pour fonction d'atténiation A(dp)
	float lightDistance = length(lightDirection);
	// fonction d'atténiation A(dp)
	float Adp = 1.0/(lightDistance*lightDistance);
	vec3 modelViewLight = vec3(viewMatrix * vec4(lightDirection, 0.0));

	vec3 n = normalize(modelViewNormal);
	vec3 l = normalize(-modelViewLight); // l = normalize(vec3(modelViewMatrix) * lightDirection);
	vec3 halfway = normalize(l + viewDirection);

	// (n * l)
	float diffuse = max(dot(n, l), 0.0);

	// (r * v)^n
	float specular = pow(max(dot(n, halfway), 0.0),shininess);

	vec3 ambiantColor = mix(materialAmbientColor,maskLightColor,vec3(texture2D(textureMask, UV)));
	vec3 diffuseColor = mix(materialDiffuseColor,maskLightColor,vec3(texture2D(textureMask, UV)));
	vec3 specularColor = mix(materialSpecularColor,maskLightColor,vec3(texture2D(textureMask, UV)));

	float intensity = dot(-modelViewLight,normalize(modelViewNormal));
	vec3 vertexColor = ambiantColor*ambientLightColor  + lightColor * ( diffuseColor*diffuse +  specularColor*specular );;
	if (length(vertexColor) > length(vec3(0.95,0.95,0.95)))
		{vertexColor = ambiantColor*vec3(0.8,0.8,0.8)  *diffuseColor+ vec3(0.8,0.8,0.8) ;}
	else if (length(vertexColor) > length(vec3(0.4,0.4,0.4)))
		{vertexColor = ambiantColor*vec3(0.5,0.5,0.5)  + vec3(0.5,0.5,0.5) *diffuseColor;}

	else if (length(vertexColor) > length(vec3(0.2,0.2,0.2)))
		{vertexColor = ambiantColor*vec3(0.3,0.3,0.3)  + vec3(0.3,0.3,0.3) *diffuseColor;}
	else
		{vertexColor = ambiantColor*vec3(0.2,0.2,0.2)  + vec3(0.1,0.1,0.1) *diffuseColor;}

	// I = Ia*Ka + Ip * (Kd * (n*l) + Ks * (r * v)^n)
	//vec3 vertexColor = ambiantColor*ambientLightColor  + lightColor * ( diffuseColor*diffuse +  specularColor*specular );

	gl_FragColor = vec4(vertexColor,1.0)*texture2D(textureNumberMask, UV);


}