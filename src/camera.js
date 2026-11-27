import { createLookAtMat4, createPerspectiveMat4 } from '../lib/utils.js';

export class Camera {
    constructor(canvas, options = {}) {
        const {
            target = [0, 1.8, 0],
            distance = 7,
            minDistance = 3,
            maxDistance = 18,
            yaw = 0.6,
            pitch = 0.35,
            fovy = Math.PI / 4,
            near = 0.1,
            far = 100,
        } = options;

        this.canvas = canvas;
        this.target = target;
        this.distance = distance;
        this.minDistance = minDistance;
        this.maxDistance = maxDistance;
        this.yaw = yaw;
        this.pitch = pitch;
        this.fovy = fovy;
        this.near = near;
        this.far = far;

        // PESSOA C: registrar aqui os listeners de 'wheel' (zoom) e de
        // mousedown/mousemove/mouseup (orbita). Basta alterar
        // this.distance, this.yaw e this.pitch — a conta ja esta feita
        // no getViewMatrix() e nao precisa mudar.
    }

    getViewMatrix() {
        const cosPitch = Math.cos(this.pitch);

        const eye = [
            this.target[0] + this.distance * cosPitch * Math.sin(this.yaw),
            this.target[1] + this.distance * Math.sin(this.pitch),
            this.target[2] + this.distance * cosPitch * Math.cos(this.yaw),
        ];

        return createLookAtMat4(eye, this.target, [0, 1, 0], true);
    }

    getProjectionMatrix(aspect) {
        return createPerspectiveMat4(this.fovy, aspect, this.near, this.far);
    }
}