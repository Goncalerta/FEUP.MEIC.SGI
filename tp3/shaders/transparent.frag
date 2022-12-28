#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 colorRGBa;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord);

	if (color.a < 0.5) {
		discard;
	} else if (color.r == 0.0 && color.g == 0.0 && color.b == 0.0) { // if black, then use colorRGBa
		gl_FragColor = colorRGBa;
	} else {
		gl_FragColor = color;
	}
}
