#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

varying vec4 coords;
varying vec4 normal;
uniform float timeFactor;
uniform vec4 highlightColor;

void main() {
	vec4 original = texture2D(uSampler, vTextureCoord);
	gl_FragColor = original + (highlightColor - original)*timeFactor;
}
