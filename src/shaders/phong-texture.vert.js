import { UNIFORMS_WGSL } from '../uniforms.js';

export default /* wgsl */ `
${UNIFORMS_WGSL}

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) uv : vec2f,
  @location(1) viewPosition : vec3f,
  @location(2) viewNormal : vec3f,
};

@vertex
fn main(
  @location(0) position : vec4f,
  @location(1) uv : vec2f,
  @location(2) normal : vec4f,
) -> VertexOutput {
  let modelView = uniforms.view * uniforms.model;
  let viewPosition = modelView * position;

  var output : VertexOutput;
  output.position = uniforms.projection * viewPosition;
  output.uv = uv;
  output.viewPosition = viewPosition.xyz;
  output.viewNormal = (uniforms.normalMatrix * normal).xyz;
  return output;
}
`;