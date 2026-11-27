import WebGPU from './lib/webgpu.js';
import { createIdentityMat4, createScaleMat4, createTranslationMat4, multiplyMat4 } from './lib/utils.js';
import { Camera } from './src/camera.js';
import { Renderable, SOLID_BUFFERS, TEXTURED_BUFFERS } from './src/renderable.js';
import solidVertShader from './src/shaders/phong-solid.vert.js';
import solidFragShader from './src/shaders/phong-solid.frag.js';
import { createCubeGeometry } from './src/scene/placeholder.js';
import textureVertShader from './src/shaders/phong-texture.vert.js';
import textureFragShader from './src/shaders/phong-texture.frag.js';
import { createFloorGeometry } from './src/scene/floor.js';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

// Cor solida do fundo (requisito do enunciado).
const BACKGROUND_COLOR = { r: 0.42, g: 0.50, b: 0.58, a: 1.0 };

class Scene {
    constructor(gpu, camera, { floorTexture }) {
        this.camera = camera;

        // DUAS LUZES PONTUAIS, em coordenadas de MUNDO.
        this.lights = [
            {
                position: [5.0, 6.0, 2.0, 1.0],
                ambient:  [1.00, 1.00, 1.00, 0.18],
                diffuse:  [1.00, 0.97, 0.90, 0.85],
                specular: [1.00, 1.00, 1.00, 0.35],
            },
            {
                position: [-5.0, 3.0, -2.0, 1.0],
                ambient:  [1.00, 1.00, 1.00, 0.06],
                diffuse:  [0.75, 0.82, 1.00, 0.45],
                specular: [1.00, 1.00, 1.00, 0.20],
            },
        ];

        this.solidProgram = gpu.createProgram(solidVertShader, solidFragShader, {
            cullMode: 'back',
            frontFace: 'ccw',
            buffers: SOLID_BUFFERS,
        });

        this.objects = [];

        this.texturedProgram = gpu.createProgram(textureVertShader,            textureFragShader, {
            cullMode: 'back',
            frontFace: 'ccw',
            buffers: TEXTURED_BUFFERS,
        });

        // addressMode 'repeat' e a OUTRA METADE da repeticao da textura
        const floorSampler = gpu.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'linear',
        });

        this.objects.push(new Renderable(gpu, this.texturedProgram, createFloorGeometry({ repeat: 4 }), {
            name: 'chao',
            modelMatrix: createIdentityMat4(),
            material: [0.30, 0.90, 0.10, 16.0],   // azulejo: fosco, brilho largo e discreto
            baseColor: [1, 1, 1, 1],              // nao usado: o albedo vem da textura
            texture: floorTexture,
            sampler: floorSampler,
}));

        // TEMPORARIO: cubo de teste, no lugar onde o coelho vai ficar
        this.objects.push(new Renderable(gpu, this.solidProgram, createCubeGeometry(), {
            name: 'cubo de teste',
            modelMatrix: multiplyMat4(
                createTranslationMat4(0, 1.8, 0),
                createScaleMat4(2, 2, 2),
            ),
            material: [0.25, 0.85, 0.25, 48.0],
            baseColor: [0.92, 0.90, 0.86, 1.0],
        }));
    }

    draw(gpu) {
        const view = this.camera.getViewMatrix();
        const projection = this.camera.getProjectionMatrix(CANVAS_WIDTH / CANVAS_HEIGHT);

        for (const object of this.objects) {
            object.draw(gpu, view, projection, this.lights);
        }
    }
}

class Main {
    async init() {
        this.gpu = await WebGPU.createCanvas('#glcanvas', CANVAS_WIDTH, CANVAS_HEIGHT, {
            clearColor: BACKGROUND_COLOR,
            depth: true,
        });

        const floorTexture = await this.gpu.createTextureFromImage(
            new URL('./assets/Tiles074_1K-JPG_Color.jpg', import.meta.url),
        );

        this.camera = new Camera(this.gpu.canvas);
        this.scene = new Scene(this.gpu, this.camera, { floorTexture });
    }

    draw() {
        this.gpu.start();
        this.scene.draw(this.gpu);
        this.gpu.finish();
        requestAnimationFrame(this.draw.bind(this));
    }
}

try {
    const app = new Main();
    await app.init();
    app.draw();
} catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML('beforeend',
    `<p style="position:relative; z-index:1; background:#fff; color:#b00">${error.message}</p>`);
}