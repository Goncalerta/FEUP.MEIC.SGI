#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec2 dims;
uniform vec2 charCoords;
uniform vec4 colorRGBa;

varying vec2 vTextureCoord;

void main() {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

	if (dims.x == 0.0 && dims.y == 0.0) {
		vTextureCoord = aTextureCoord;
	} else {
		vTextureCoord = (charCoords + aTextureCoord) / dims;
	}
}
