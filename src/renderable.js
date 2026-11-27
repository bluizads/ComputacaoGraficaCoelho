import { createNormalMat4, multiplyMat4 } from '../lib/utils.js';
import { UNIFORM_FLOATS, writeUniforms } from './uniforms.js';

// shaderLocation tem que casar com os @location do phong-solid.vert.js.
export const SOLID_BUFFERS = [
    { arrayStride: 4 * 4, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }] }, // position
    { arrayStride: 4 * 4, attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x4' }] }, // normal
];

// objeto TEXTURIZADO (o chao)
export const TEXTURED_BUFFERS = [
    { arrayStride: 4 * 4, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }] }, // position
    { arrayStride: 2 * 4, attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x2' }] }, // uv
    { arrayStride: 4 * 4, attributes: [{ shaderLocation: 2, offset: 0, format: 'float32x4' }] }, // normal
];

export class Renderable {
    constructor(gpu, program, geometry, options) {
        const {
            modelMatrix,
            material,
            baseColor,
            texture = null,
            sampler = null,
            name = 'objeto',
        } = options;

        this.name = name;
        this.program = program;
        this.modelMatrix = modelMatrix;
        this.material = material;
        this.baseColor = baseColor;

        if (texture && !geometry.uvs) {
            throw new Error(`${name}: objeto com textura precisa de coordenadas uv na geometria.`);
        }

        // A ORDEM tem que ser a mesma de SOLID_BUFFERS / TEXTURED_BUFFERS
        const buffers = texture
            ? [geometry.positions, geometry.uvs, geometry.normals]
            : [geometry.positions, geometry.normals];

        this.shape = gpu.createShape({
            buffers,
            indices: geometry.indices,
            indexFormat: 'uint32',
            vertexCount: geometry.vertexCount,
        });

        // Cada objeto tem o SEU uniform buffer
        this.uniform = {
            data: new Float32Array(UNIFORM_FLOATS),
            buffer: gpu.createUniformBuffer(new Float32Array(UNIFORM_FLOATS)),
        };

        // liga os recursos aos @binding do shader
        const entries = [{ binding: 0, resource: { buffer: this.uniform.buffer } }];

        if (texture) {
            entries.push(
                { binding: 1, resource: sampler },
                { binding: 2, resource: texture.createView() },
            );
        }

        this.bindGroup = gpu.createBindGroup(program, entries);

        this.triangleCount = geometry.indices.length / 3;
    }

    draw(gpu, view, projection, lights) {
        // normalMatrix depende da view, (muda quando a camera se move, e é recalculada a cada frame
        // modelMatrix nao: os objetos da cena sao estaticos
        const modelView = multiplyMat4(view, this.modelMatrix);

        writeUniforms(this.uniform.data, {
            model: this.modelMatrix,
            view,
            projection,
            normalMatrix: createNormalMat4(modelView),
            lights,
            material: this.material,
            baseColor: this.baseColor,
        });

        gpu.writeBuffer(this.uniform.buffer, this.uniform.data);
        gpu.draw(this.program, this.shape, [this.bindGroup]);
    }
}