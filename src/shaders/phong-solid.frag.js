import { UNIFORMS_WGSL } from '../uniforms.js';

export default /* wgsl */ `
${UNIFORMS_WGSL}

@fragment
fn main(
  @location(0) viewPosition : vec3f,
  @location(1) viewNormal : vec3f,
) -> @location(0) vec4f {
  let normal = normalize(viewNormal);
  let albedo = uniforms.baseColor.rgb;
  let mat = uniforms.material;          // (ka, kd, ks, expoente)

  // >>>>>>> TEMPORARIO: somar as DUAS luzes num laco sobre uniforms.lights
  let light = uniforms.lights[0];

  let lightPosition = (uniforms.view * light.position).xyz;
  let lightDir = normalize(lightPosition - viewPosition);
  let cameraDir = normalize(-viewPosition);

  let nDotL = max(0.0, dot(lightDir, normal));

  let halfVector = normalize(lightDir + cameraDir);
  let specularFactor = pow(max(0.0, dot(halfVector, normal)), mat.w);

  let ambient = mat.x * light.ambient.a * light.ambient.rgb * albedo;
  let diffuse = mat.y * nDotL * light.diffuse.a * light.diffuse.rgb * albedo;
  let specular = select(
    vec3f(0.0),
    mat.z * specularFactor * light.specular.a * light.specular.rgb,
    nDotL > 0.0
  );

  return vec4f(ambient + diffuse + specular, 1.0);
}
`;