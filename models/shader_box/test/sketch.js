let shader;
let vert = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;

void main() {
  vPosition = (uModelViewMatrix * vec4(aPosition, 1.0)).xyz;
  vNormal = normalize(uNormalMatrix * aNormal);
  vTexCoord = aTexCoord;
  gl_Position = uProjectionMatrix * vec4(vPosition, 1.0);
}

`;

let frag = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;

void main() {
  vPosition = (uModelViewMatrix * vec4(aPosition, 1.0)).xyz;
  vNormal = normalize(uNormalMatrix * aNormal);
  vTexCoord = aTexCoord;
  gl_Position = uProjectionMatrix * vec4(vPosition, 1.0);
}

`;

let easycam;
function setup() {
  createCanvas(400, 400, WEBGL);
  shader = createShader(vert, frag);
  easycam = createEasyCam();
  shader.setUniform("uLightPosition", [0, 0, 0]);
  shader.setUniform("uLightColor", [1, 1, 1, 1]);
  shader.setUniform("uMaterialColor", [1, 0, 0, 1]);
}

let modelViewMatrix,projectionMatrix,normalMatrix,positions,normals,texCoords

function draw() {

　clear();
  shader.setUniform("uModelViewMatrix", modelViewMatrix);
  shader.setUniform("uProjectionMatrix", projectionMatrix);
  shader.setUniform("uNormalMatrix", normalMatrix);
　//shader.setAttributes("aPosition", positions);
  //shader.setAttributes("aNormal", normals);
  //shader.setAttributes("aTexCoord", texCoords);
  //shader.bindBuffers(positions.length);
  sphere(50);
  //shader.unbindBuffers();
}