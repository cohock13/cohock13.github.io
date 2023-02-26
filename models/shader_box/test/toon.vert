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
