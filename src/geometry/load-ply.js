//  Leitor de arquivos PLY em ASCII.

 // Devolve:
 //   coords: Float32Array com x, y, z, 1 por vertice (grupos de 4)
 //  indices: Uint32Array com 3 indices por triangulo
 
export function parsePly(text) {
    const fimCabecalho = text.indexOf('end_header');
    if (fimCabecalho === -1) {
        throw new Error('Arquivo PLY invalido: nao achei "end_header".');
    }

    const cabecalho = text.slice(0, fimCabecalho).split('\n');
    const corpo = text.slice(fimCabecalho + 'end_header'.length);

    let vertexCount = 0;
    let faceCount = 0;
    let vertexPropertyCount = 0;
    let elementoAtual = null;

    for (const linha of cabecalho) {
        const campos = linha.trim().split(/\s+/);

        if (campos[0] === 'format' && campos[1] !== 'ascii') {
            throw new Error(`PLY '${campos[1]}' nao suportado: este leitor le apenas ascii.`);
        }

        if (campos[0] === 'element') {
            elementoAtual = campos[1];
            if (elementoAtual === 'vertex') vertexCount = Number(campos[2]);
            if (elementoAtual === 'face') faceCount = Number(campos[2]);
        }

        // Conta as propriedades SÓ do elemento vertex. As do elemento face nao entram
        if (campos[0] === 'property' && elementoAtual === 'vertex') {
            vertexPropertyCount++;
        }
    }

    if (!vertexCount || !faceCount) {
        throw new Error('Arquivo PLY invalido: nao achei a contagem de vertices ou de faces.');
    }
    if (vertexPropertyCount < 3) {
        throw new Error(`Vertice com ${vertexPropertyCount} propriedades: preciso de ao menos x, y, z.`);
    }

    const tokens = corpo.trim().split(/\s+/);
    let cursor = 0;

    // coords em grupos de 4: x, y, z, 1
    const coords = new Float32Array(vertexCount * 4);

    for (let v = 0; v < vertexCount; v++) {
        coords[v * 4 + 0] = Number(tokens[cursor + 0]);
        coords[v * 4 + 1] = Number(tokens[cursor + 1]);
        coords[v * 4 + 2] = Number(tokens[cursor + 2]);
        coords[v * 4 + 3] = 1;

        cursor += vertexPropertyCount;   // pula confidence, intensity, etc
    }

    const indices = [];

    for (let f = 0; f < faceCount; f++) {
        const n = Number(tokens[cursor++]);
        const face = [];

        for (let k = 0; k < n; k++) {
            face.push(Number(tokens[cursor++]));
        }

        // Triangulacao em leque: um polígono de n lados vira n-2 triangulos,
        // todos partindo do primeiro vertice
        for (let k = 1; k + 1 < n; k++) {
            indices.push(face[0], face[k], face[k + 1]);
        }
    }

    return {
        coords,
        indices: new Uint32Array(indices),
        vertexCount,
        faceCount,
    };
}

export async function loadPly(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Nao consegui carregar o PLY: HTTP ${response.status}.`);
    }
    return parsePly(await response.text());
}