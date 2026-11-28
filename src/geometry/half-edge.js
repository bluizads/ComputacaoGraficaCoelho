export class Vertex {
  constructor(vid, x, y, z, color = [0.5, 0.2, 0.4, 1.0]) {
    this.vid = vid;

    this.position = [x, y, z, 1];
    this.normal = [0.0, 0.0, 0.0, 0.0];
    this.color = color;

    this.he = null;
  }
}

export class HalfEdge {
  constructor(vertex) {
    this.vertex = vertex;

    this.next = null;
    this.face = null;

    this.opposite = null;
  }
}

export class Face {
  constructor(baseHe) {
    this.baseHe = baseHe;
  }
}

export class HalfEdgeDS {
  constructor() {
    this.vertices = [];
    this.halfEdges = [];
    this.faces = [];
  }

  build(coords, trigs) {
    // Build vertices
    for (let vid = 0; vid < coords.length; vid+=4) {
      const x = coords[vid];
      const y = coords[vid + 1];
      const z = coords[vid + 2];

      const v = new Vertex(vid / 4, x, y, z);
      this.vertices.push(v);
    }

    // Build faces and half-edges
    for (let tid = 0; tid < trigs.length; tid+=3) {
      const v0  = this.vertices[ trigs[tid + 0] ];
      const v1  = this.vertices[ trigs[tid + 1] ];
      const v2  = this.vertices[ trigs[tid + 2] ];

      const he0 = new HalfEdge(v0);
      const he1 = new HalfEdge(v1);
      const he2 = new HalfEdge(v2);

      const face = new Face(he0);
      this.faces.push(face);

      // Assign faces.
      he0.face = face;
      he1.face = face;
      he2.face = face;

      // Link the face cycle
      he0.next = he1;
      he1.next = he2;
      he2.next = he0;

      this.halfEdges.push(he0, he1, he2);
    }

    this.computeOpposites();
    this.computeVertexHe();

    this.computeNormals();

  }

  computeOpposites() {
    const visited = {};

    for (let hid = 0; hid < this.halfEdges.length; hid ++) {
      const a = this.halfEdges[hid].vertex.vid;
      const b = this.halfEdges[hid].next.vertex.vid;

      const k = `k${Math.min(a,b)},${Math.max(a,b)}`;

      if (visited[k] !== undefined) {
        const op = visited[k];
        op.opposite = this.halfEdges[hid];
        this.halfEdges[hid].opposite = op;

        delete visited[k];
      }
      else {
        visited[k] = this.halfEdges[hid];
      }
    }
  }

  computeVertexHe() {
    for (let hid = 0; hid < this.halfEdges.length; hid ++) {
      const v = this.halfEdges[hid].vertex;

      if (v.he === null) {
        v.he = this.halfEdges[hid];
      }
      else if(this.halfEdges[hid].opposite === null) {
        v.he = this.halfEdges[hid];
      }
    }
  }

  computeNormals() {
    for (const v of this.vertices) {
        const incidentes = this.estrela(v);

        let nx = 0, ny = 0, nz = 0;

        for (const he of incidentes) {
            const a = he.vertex.position;             // = v
            const b = he.next.vertex.position;
            const c = he.next.next.vertex.position;

            const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
            const w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];

            // Produto vetorial NAO normalizado: o modulo dele vale o dobro da
            // area do triangulo, entao faces maiores pesam mais na media.
            nx += u[1] * w[2] - u[2] * w[1];
            ny += u[2] * w[0] - u[0] * w[2];
            nz += u[0] * w[1] - u[1] * w[0];
        }

        const comprimento = Math.hypot(nx, ny, nz);

        v.normal = (comprimento > 1e-12)
            ? [nx / comprimento, ny / comprimento, nz / comprimento, 0]
            : [0, 1, 0, 0];   // isolado ou degenerado: direcao qualquer, mas valida
    }
  }

  getVBOs() {
    const coords  = [];
    const colors  = [];
    const normals = [];
    const indices = [];

    for (let vId = 0; vId < this.vertices.length; vId++) {
      const v = this.vertices[vId];

      coords.push(...v.position);
      colors.push(...v.color);
      normals.push(...v.normal);
    }

    for (let hid = 0; hid < this.halfEdges.length; hid++) {
      indices.push(this.halfEdges[hid].vertex.vid);
    }

    return [coords, colors, normals, indices];
  }


  
estrela(v) {
  //Devolve as semi-arestas de origem v, uma por face incidente (a "estrela" de v).
 
  //  Rotacao para frente: he -> he.next.next.opposite (num triangulo, next.next e a semi-aresta anterior)
  //  Em vertice interior o laco fecha ao voltar em v.he.
  //  Em vertice de bordo, para quando a anterior nao tem oposta

    const incidentes = [];

    // Vertice isolado: nao pertence a nenhuma face. O bun_zipper.ply tem 1113
    if (v.he === null) {
        return incidentes;
    }

    let he = v.he;

    do {
        incidentes.push(he);

        const anterior = he.next.next;   // o "prev" do triangulo

        // Chegou no outro extremo do bordo: nao da para continuar girando
        if (anterior.opposite === null) {
            break;
        }

        he = anterior.opposite;

        // Trava de seguranca: malha nao-manifold poderia nunca voltar a v.he e travar o navegador num laco infinito
        if (incidentes.length > 10000) {
            break;
        }
    } while (he !== v.he);

    return incidentes;
}
}
