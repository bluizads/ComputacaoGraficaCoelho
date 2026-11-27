//Chao plano em y = 0, formado por uma grade de triangulos
 
 //size:  lado do quadrado, em unidades de mundo (o chao vai de -size/2 a +size/2 em x e z)
 //divisions: quantas celulas por lado (cada celula = 2 triangulos)
 //repeat:    quantas vezes a textura se repete ao longo de um lado
 

export function createFloorGeometry({ size = 30, divisions = 30, repeat = 15 } = {}) {
    const positions = [];
    const uvs = [];
    const normals = [];
    const indices = [];

    const half = size / 2;
    const step = size / divisions;

    for (let i = 0; i < divisions; i++) {
        for (let j = 0; j < divisions; j++) {
            const x = -half + i * step;
            const z = -half + j * step;

            // ORDEM DOS CANTOS: avanca em Z primeiro
            const corners = [
                [x,        z       ],   // c0
                [x,        z + step],   // c1
                [x + step, z + step],   // c2
                [x + step, z       ],   // c3
            ];

            const base = positions.length / 4;

            for (const [cx, cz] of corners) {
                positions.push(cx, 0, cz, 1);

                // uv vai de 0 ate repeat (nao ate 1)
                uvs.push(
                    ((cx + half) / size) * repeat,
                    ((cz + half) / size) * repeat,
                );

                // Chao plano: a normal é a mesma em todo vertice
                // w = 0 porque normal é direcao, nao ponto
                normals.push(0, 1, 0, 0);
            }

            indices.push(
                base, base + 1, base + 2,
                base, base + 2, base + 3,
            );
        }
    }

    return {
        positions,
        uvs,
        normals,
        indices,
        vertexCount: positions.length / 4,
    };
}