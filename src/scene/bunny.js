import { HalfEdgeDS } from '../geometry/half-edge.js';
import { createScaleMat4, createTranslationMat4, multiplyMat4 } from '../../lib/utils.js';


//Caixa de um array de coordenadas em grupos de 4 (x, y, z, w).
 
function caixaEnvolvente(coords) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < coords.length; i += 4) {
        minX = Math.min(minX, coords[i    ]); maxX = Math.max(maxX, coords[i    ]);
        minY = Math.min(minY, coords[i + 1]); maxY = Math.max(maxY, coords[i + 1]);
        minZ = Math.min(minZ, coords[i + 2]); maxZ = Math.max(maxZ, coords[i + 2]);
    }

    return { minX, maxX, minY, maxY, minZ, maxZ };
}

export function createBunnyGeometry(coords, indices) {
    const heds = new HalfEdgeDS();
    heds.build(coords, indices);

    const [positions, colors, normals, triangles] = heds.getVBOs();

    return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        indices: new Uint32Array(triangles),
        vertexCount: heds.vertices.length,
        bounds: caixaEnvolvente(coords),
        heds,   // guardado para inspecionar no console
    };
}

 //Matriz de modelo do coelho: centraliza no eixo y, redimensiona, e apoia a base no topo da mesa

export function createBunnyModelMatrix(bounds, { escala = 8, topoDaMesa = 1.6 } = {}) {
    const centroX = (bounds.minX + bounds.maxX) / 2;
    const centroZ = (bounds.minZ + bounds.maxZ) / 2;

    // leva o centro para o eixo y e o ponto mais baixo para y = 0
    const centralizar = createTranslationMat4(-centroX, -bounds.minY, -centroZ);
    // o coelho vem com 15 cm de altura; escala uniforme
    const redimensionar = createScaleMat4(escala, escala, escala);
    // sobe para o topo da mesa
    const subir = createTranslationMat4(0, topoDaMesa, 0);

    // multiplyMat4(a, b) = A·B
    // Entao T·(S·C) : centralizar -> escalar -> subir
    return multiplyMat4(subir, multiplyMat4(redimensionar, centralizar));
}