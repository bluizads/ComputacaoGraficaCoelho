Implemente, em WebGPU, uma cena 3D interativa contendo o modelo Stanford Bunny apoiado sobre uma mesa modelada implicitamente, posicionada sobre um chão texturizado. Use como base os códigos produzidos em sala e disponíveis em https://github.com/mlage/curso-cg.

# 1. Composição da cena
A cena deve conter:

- o modelo Stanford Bunny, com material de cor sólida clara;
- uma mesa, com topo plano e laterais curvas, com material de cor sólida azul;
- um chão plano, formado por triângulos e coberto por uma textura;
- um fundo representado por uma cor sólida.

A mesa deve estar apoiada no chão, e o Bunny deve estar centralizado sobre ela. Utilize transformações de escala e translação para ajustar o tamanho e a posição do Bunny, garantindo que ele fique apoiado sobre o topo da mesa.

Os objetos devem permanecer estáticos. Use a imagem em anexo como referência para a composição.

# 2. Modelo Stanford Bunny
Utilize a malha reconstruída bun_zipper.ply, disponível no , fornecido pelo  e disponível em https://graphics.stanford.edu/data/3Dscanrep/.
- Carregue os vértices e as faces do arquivo PLY.
- Construa uma representação da malha usando a estrutura half-edge, com informações sobre vértices, faces e semi-arestas.
- Utilize essa estrutura para percorrer as faces incidentes a cada vértice e calcular as normais por vértice.
- Normalize as normais calculadas e utilize-as na iluminação do modelo.
- Trate corretamente as arestas de bordo, pois o modelo possui aberturas na base.

A estrutura half-edge deve ser utilizada efetivamente no cálculo das normais. Apenas construir e armazenar a estrutura não atende a esse requisito.

# 3. Modelagem implícita da mesa
Adote y como eixo vertical e modele a mesa pela superfície implícita:

F(x,y,z)=0,
em que:
F(x,y,z)= max(x^2 + z^2 - 0.36 - 2.5(y-0.8)^2, -y,  y - 1.6).

O interior da mesa corresponde aos pontos em que F(x,y,z)<0.
Essa função define uma mesa com:
- altura de 1,6 unidade;
- raio de 0,6 unidade na altura intermediária;
- raio de 1,4 unidade no topo e na base;
- topo e base planos, nas alturas y=1.6 e y=0.
Implemente o algoritmo para gerar uma malha triangular da superfície, incluindo as laterais, o topo e a base.
- Avalie a função nos vértices de uma grade regular no domínio: [-1.6, 1.6] x [-0.2, 1.8] x [-1.6, 1.6].
- Determine os casos de cada célula e calcule as interseções com suas arestas por interpolação linear.
- Escolha uma resolução que represente adequadamente a curvatura da mesa e informe essa resolução no relatório.
- Calcule normais apropriadas para iluminar a malha gerada.
A malha pode ser gerada uma única vez, durante a inicialização da aplicação. 

# 4. Textura do chão
Utilize a textura disponível em https://ambientcg.com/view?id=Tiles074. Baixe o pacote 1K-JPG e utilize como textura do chão apenas a imagem identificada por no nome do arquivo.

- Defina coordenadas de textura para os vértices do chão.
- Configure a repetição da textura para que o padrão apareça várias vezes sobre o plano.
- Realize a amostragem da textura no shader de fragmentos.
- Utilize a cor amostrada como cor difusa do material do chão.

# 5. Iluminação e materiais
Implemente o modelo de iluminação de Phong por fragmento, utilizando duas fontes de luz pontuais em posições distintas.
- Considere as componentes ambiente, difusa e especular.
- Defina os coeficientes dos materiais e o expoente especular.
- Interpole e normalize as normais no shader de fragmentos.
- Transforme posições e normais para um sistema de coordenadas consistente com o cálculo da iluminação.
- Mantenha as luzes fixas na cena durante a movimentação da câmera.
Os materiais do Bunny e da mesa devem usar cores sólidas e brilho especular discreto. Não implemente sombras, reflexões ou iluminação global.

# 6. Câmera, projeção e interação
- A roda do mouse deve controlar a distância da câmera ao centro da cena.
- A câmera deve permanecer orientada para a região central da mesa e do Bunny.
- A projeção deve ser perspectiva.
- Utilize teste de profundidade para determinar a visibilidade dos objetos.

# 7. Observações:
Não utilize bibliotecas de renderização. As implementações de marching cubes e half-edge devem ser desenvolvidas pelo grupo, aproveitando os códigos produzidos em sala.

## Entregáveis:
- Código-fonte completo, desenvolvido usando os códigos produzidos em sala como base, acompanhado dos arquivos necessários e das instruções de execução.
- Relatório explicando trechos relevantes da implementação.
- Imagens da aplicação obtidas de diferentes posições da câmera.

## Critérios de avaliação
- Carregamento e posicionamento do Stanford Bunny: 1,0 ponto
- Modelagem implícita e geração da mesa por marching cubes: 2,0 pontos
- Implementação e uso da half-edge no cálculo das normais: 2,0 pontos
- Mapeamento e aplicação da textura do chão: 1,0 ponto
- Iluminação de Phong com duas luzes pontuais: 1,5 ponto
- Câmera interativa, transformações e projeção perspectiva: 1,5 ponto
- Relatório: 1,0 ponto