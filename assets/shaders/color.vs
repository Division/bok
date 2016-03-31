uniform mat4 matrix;

attribute vec2 a_position;
attribute vec4 a_color;
attribute float a_pointSize;

varying vec4 v_color;

void main() {
  v_color = a_color;
  gl_PointSize = a_pointSize;
  gl_Position = matrix * vec4(a_position, 0, 1);
}
