// TEMPORARIO: cubo copiado da aula "13b - textura 2d" do curso, so para validar o
// pipeline antes de o coelho e o chao existirem. Apagar na integracao.


export function createCubeGeometry() {
    const half = 0.5;

    const faces = [
        {
            normal: [0, 0, 1],
            corners: [
                [-half, -half, half],
                [half, -half, half],
                [half, half, half],
                [-half, half, half],
            ],
        },
        {
            normal: [0, 0, -1],
            corners: [
                [half, -half, -half],
                [-half, -half, -half],
                [-half, half, -half],
                [half, half, -half],
            ],
        },
        {
            normal: [1, 0, 0],
            corners: [
                [half, -half, half],
                [half, -half, -half],
                [half, half, -half],
                [half, half, half],
            ],
        },
        {
            normal: [-1, 0, 0],
            corners: [
                [-half, -half, -half],
                [-half, -half, half],
                [-half, half, half],
                [-half, half, -half],
            ],
        },
        {
            normal: [0, 1, 0],
            corners: [
                [-half, half, half],
                [half, half, half],
                [half, half, -half],
                [-half, half, -half],
            ],
        },
        {
            normal: [0, -1, 0],
            corners: [
                [-half, -half, -half],
                [half, -half, -half],
                [half, -half, half],
                [-half, -half, half],
            ],
        },
    ];

    const uvs = [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
    ];

    const positions = [];
    const texCoords = [];
    const normals = [];
    const indices = [];

    for (const face of faces) {
        const base = positions.length / 4;

        for (const corner of face.corners) {
            positions.push(...corner, 1);
        }

        for (const uv of uvs) {
            texCoords.push(...uv);
        }

        for (let i = 0; i < 4; i++) {
            normals.push(...face.normal, 0);
        }

        indices.push(
            base, base + 1, base + 2,
            base, base + 2, base + 3,
        );
    }

    return {
        positions,
        uvs: texCoords,
        normals,
        indices,
        vertexCount: positions.length / 4,
    };
}
