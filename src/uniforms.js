export const LIGHT_FLOATS = 16;
export const LIGHT_COUNT = 2;

//CAMPO         TIPO WGSL       FLOATS    OFFSET
//model         mat4x4f         16      começa em 0    ocupa 16   próximo livre: 0 + 16  = 16
//view          mat4x4f         16      começa em 16   ocupa 16   próximo livre: 16 + 16 = 32
//projection    mat4x4f         16      começa em 32   ocupa 16   próximo livre: 32 + 16 = 48
//normalMatrix  mat4x4f         16      começa em 48   ocupa 16   próximo livre: 48 + 16 = 64
//lights        array<Light, 2> 32      começa em 64   ocupa 32   próximo livre: 64 + 32 = 96     (2 luzes × 16)
//material      vec4f           4       começa em 96   ocupa 4    próximo livre: 96 + 4  = 100
//baseColor     vec4f           4       começa em 100  ocupa 4    próximo livre: 100 + 4 = 104    <- total

// Em cada cor de luz (ambient, diffuse, specular), os 3 primeiros slots sao
// RGB e o QUARTO (.a) e a INTENSIDADE daquela componente, nao opacidade.
// Convencao herdada dos exemplos do professor.

//  Dentro de lights, a luz i comeca em 64 + i * LIGHT_FLOATS:
//    +0  position   vec4f
//    +4  ambient    vec4f
//    +8  diffuse    vec4f
//   +12  specular   vec4f

//                  luz 0 (começa em 64)	luz 1 (começa em 80)
//position (+0)	    posicao 64	            posicao 80
//ambient (+4)	    posicao 68	            posicao 84
//diffuse (+8)	    posicao 72	            posicao 88
//specular (+12)	posicao 76	            posicao 92

// Calculo:   64 + i * 16 + (0, 4, 8 ou 12)

//  ATENCAO: position vem em coordenadas de MUNDO (w = 1). Cada shader
//  multiplica por uniforms.view para levar ao espaco de camera, a cada
//  frame. E isso que mantem as luzes fixas na cena quando a camera se move.

// OBS: material (ka, kd, ks, expoente especular)
// ka é ambiente, kd difusa, ks especular e o quarto é o expoente que controla a concentração do brilho

export const OFFSETS = {
    model: 0,
    view: 16,
    projection: 32,
    normalMatrix: 48,
    lights: 64,
    material: 96,
    baseColor: 100,
};

export const UNIFORM_FLOATS = 104;
export const UNIFORM_BYTES = UNIFORM_FLOATS * 4;

export const UNIFORMS_WGSL = /* wgsl */ `
struct Light {
  position: vec4f,
  ambient:  vec4f,
  diffuse:  vec4f,
  specular: vec4f,
};

struct Uniforms {
    model :         mat4x4f,
    view :          mat4x4f,
    projection :    mat4x4f,
    normalMatrix :  mat4x4f,
    lights  :   array<Light, ${LIGHT_COUNT}>,
    material :  vec4f,
    baseColor : vec4f,
};

@group(0) @binding(0) var<uniform> uniforms : Uniforms;
`;

export function writeUniforms(data, values) {
    // data = Float32Array
    const { model, view, projection, normalMatrix, lights, material, baseColor } = values;

    if (lights.length !== LIGHT_COUNT){
        throw new Error(
            `A cena precisa de exatamente ${LIGHT_COUNT} luzes (recebeu ${lights.length}).`
        );
    }

    // QUATRO MATRIZES: data.set(valor, offset)
    data.set(model, OFFSETS.model);                 // posições 0 a 15
    data.set(view, OFFSETS.view);                   // 16 a 31
    data.set(projection, OFFSETS.projection);       // 32 a 47
    data.set(normalMatrix, OFFSETS.normalMatrix);   // 48 a 63

    // DUAS LUZES: base é onde a luz i começa (64 para i = 0, 80 para i = 1)
    for (let i=0; i < LIGHT_COUNT; i++){
        const base = OFFSETS.lights + i * LIGHT_FLOATS;
        const light = lights[i];

        data.set(light.position, base);        // +0
        data.set(light.ambient,  base + 4);    // +4
        data.set(light.diffuse,  base + 8);    // +8
        data.set(light.specular, base + 12);   // +12
    }

    // MATERIAL E COR BASE
    data.set(material, OFFSETS.material);     // posições 96 a 99
    data.set(baseColor, OFFSETS.baseColor);   // 100 a 103

    return data;

}