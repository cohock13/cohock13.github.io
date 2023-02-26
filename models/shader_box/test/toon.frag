precision mediump float;

uniform vec3 uLightPosition;
uniform vec4 uLightColor;
uniform vec4 uMaterialColor;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;

void main() {
  vec3 L = normalize(uLightPosition - vPosition);
  vec3 N = normalize(vNormal);
  float lambert = max(dot(L, N), 0.0);
  vec4 diffuse = uLightColor * uMaterialColor * lambert;
  gl_FragColor = diffuse;
}
