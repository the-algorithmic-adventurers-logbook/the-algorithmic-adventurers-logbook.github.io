
function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
}

function assert(statement, s) {
      if (!statement) {
            throw s;
      }
}

function vis10aux() {
      async function vis10() {
            // Margen del tablero
            const MARGIN1 = { top: 40, right: 10, bottom: 10, left: 10 };

            // Ancho del tablero (contado el margen)
            const WIDTH1 = 200;

            // Ancho del contenedor de dominos
            const domino_box_width = 0;

            // Ancho del svg
            const svg_width = WIDTH1 + domino_box_width;

            // Cantidad de celdas horizontalmente y verticalmente
            const board_cols = 5;
            const board_rows = 5;

            // Tamanio de cada celda del tablero
            const cell_size = (WIDTH1 - MARGIN1.left - MARGIN1.right) / board_cols;

            // Seteo el alto y ancho de los dominos
            d3.select(".v_shape10")
                  .attr("width", cell_size * 0.8)
                  .attr("height", 2 * cell_size * 0.9)
                  .attr("rx", cell_size * 0.1)
            d3.select(".h_shape10")
                  .attr("height", cell_size * 0.8)
                  .attr("width", 2 * cell_size * 0.9)
                  .attr("rx", cell_size * 0.1)

            // Alto del tablero (contando el margen)
            const HEIGHT1 = cell_size * board_rows + MARGIN1.top + MARGIN1.bottom;

            // Alto y ancho del tablero sin contar el margen
            const board_width = WIDTH1 - MARGIN1.left - MARGIN1.right;
            const board_height = HEIGHT1 - MARGIN1.top - MARGIN1.bottom;

            // Tomo el svg
            const svg1 = d3.select("#board5")
                  .attr("width", svg_width)
                  .attr("height", HEIGHT1)

            // Creo el grupo para el board para meter todo lo del tablero
            const board_container = svg1.append("g")
                  .attr("class", "board_container")
                  .attr("transform", `translate(${MARGIN1.left},${MARGIN1.top})`)

            // Esta funcion me crea un arreglo de celdas
            function createGrid(rows, cols) {
                  // Creo el arreglo de arreglos
                  var matrix = new Array();

                  // Creo los arreglos de los arreglos
                  for (var row = 0; row < rows; row++) {
                        matrix.push(new Array());

                        // Creo las celdas
                        for (var col = 0; col < cols; col++) {
                              matrix[row].push({ x: col, y: row, active: false, empty: true, idx: row * board_cols + col })
                        }
                  }
                  return matrix;
            }

            // Creo la matrix
            const grid = createGrid(board_rows, board_cols);
            grid[1][1].active = true;
            grid[2][1].active = true;
            grid[2][2].active = true;
            grid[3][0].active = true;
            grid[3][1].active = true;
            grid[3][2].active = true;
            grid[3][3].active = true;
            grid[4][1].active = true;

            // Agrego la matriz al html
            const rows = board_container.selectAll(".row")
                  .data(grid)
                  .enter().append("g")
                  .attr("class", "row");

            // Click cuadrados
            function change_active(d) {
                  // console.log(d);
                  if (d.empty) {
                        if (d.active) {
                              disable_node(d.idx);
                              d.active = false;
                              this.style.fill = "rgb(255, 119, 56)";
                        }
                        else {
                              enable_node(d.idx);
                              d.active = true;
                              this.style.fill = (d.x + d.y) % 2 == 0 ? "rgb(221, 204, 255)" : "rgb(204, 224, 255)";
                        }
                  }
            }

            function highlight(d) {
                  if (d.empty) {
                        highlight_node(d.idx);
                        this.style.stroke = "black";
                  }
            }

            function unhighlight(d) {
                  if (d.empty) {
                        unhighlight_node(d.idx);
                        if (d.active) {
                              this.style.stroke = null;
                        } else {
                              this.style.stroke = "rgb(200,80,30)";
                        }
                  }
            }

            // Agrego los cuadrados a cada fila
            const grid_cells = rows.selectAll(".square")
                  .data(function (d) { return d; })
                  .enter().append("rect")
                  .attr("class", "square")
                  .attr("x", function (d) { return d.x * cell_size; })
                  .attr("y", function (d) { return d.y * cell_size; })
                  .attr("width", cell_size)
                  .attr("height", cell_size)
                  .attr("active", true)
                  .style("fill", d => {
                        if (d.active) {
                              return (d.x + d.y) % 2 == 0 ? "rgb(221, 204, 255)" : "rgb(204, 224, 255)";
                        } else {
                              return "rgb(255, 119, 56)";
                        }
                  })
                  .style("stroke_width", 0);
            // .on("dblclick", change_active)
            // .on("mouseover", highlight)
            // .on("mouseout", unhighlight);

            // Funciones de drag and drop
            function drag_start(d) {
                  // console.log(d);
                  d.dx = d3.event.x - d3.select(this).attr("x");
                  d.dy = d3.event.y - d3.select(this).attr("y");
                  if (d.original) {
                        d.original = false;
                        create_domino(d.direction);
                  } else {
                        grid[d.y][d.x].empty = true;
                        let v1 = grid[d.y][d.x].idx;
                        // Veo las posiciones de las que viene y las marco como vacias
                        // let temp = d3.selectAll(".square")
                        // .filter(function (s, i) { return i == d.x + d.y * board_cols; });
                        // temp.data()[0].empty = true;
                        // let v1 = temp.data()[0].idx;
                        let v2;
                        if (d.direction == 'v') {
                              grid[d.y + 1][d.x].empty = true;
                              v2 = grid[d.y + 1][d.x].idx;
                              // let temp = d3.selectAll(".square")
                              // .filter(function (s, i) { return i == d.x + (d.y + 1) * board_cols; });
                              // temp.data()[0].empty = true;
                              // v2 = temp.data()[0].idx;
                        } else {
                              grid[d.y][d.x + 1].empty = true;
                              v2 = grid[d.y][d.x + 1].idx;
                              // let temp = d3.selectAll(".square")
                              // .filter(function (s, i) { return i == d.x + 1 + d.y * board_cols; });
                              // temp.data()[0].empty = true;
                              // v2 = temp.data()[0].idx;
                        }
                        // console.log(v1, v2);
                        unhighlight_path(v1, v2);
                  }
            }

            function drag_drag(d) {
                  d3.select(this)
                        .attr("x", d3.event.x - d.dx)
                        .attr("y", d3.event.y - d.dy);
            }

            function drag_end(d) {
                  // Calculo la posicion en la que estoy poniendo el domino
                  let x = Math.floor((d3.event.x - d.dx) / cell_size + 0.5);
                  let y = Math.floor((d3.event.y - d.dy) / cell_size + 0.5);
                  // console.log(x, y);

                  let inside = true;
                  // Veo si cae dentro del tablero
                  if (d.direction == 'v') {
                        if (x < 0 || x >= board_cols || y < 0 || y >= board_rows - 1) {
                              inside = false;
                        }
                  }
                  else {
                        if (x < 0 || x >= board_cols - 1 || y < 0 || y >= board_rows) {
                              inside = false;
                        }
                  }

                  // Si esta en el tablero, obtengo las casillas donde cae
                  if (inside) {
                        let c1 = grid[y][x];
                        // let c1 = d3.selectAll(".square")
                        //     .filter(function (s, i) { return i == x + y * board_cols; });
                        let c2;
                        if (d.direction == 'v') {
                              c2 = grid[y + 1][x];
                              // c2 = d3.selectAll(".square")
                              //     .filter(function (s, i) { return i == x + (y + 1) * board_cols; });
                        }
                        else {
                              c2 = grid[y][x + 1];
                              // c2 = d3.selectAll(".square")
                              //     .filter(function (s, i) { return i == x + 1 + y * board_cols; });
                        }

                        // Compruebo que estan vacias y son activas
                        // if (c1.data()[0].empty && c1.data()[0].active && c2.data()[0].empty && c2.data()[0].active) {
                        if (c1.empty && c1.active && c2.empty && c2.active) {
                              // Pongo la pieza en la casilla
                              // c1.each(s => s.empty = false);
                              // c2.each(s => s.empty = false);
                              c1.empty = false;
                              c2.empty = false;
                              d.x = x;
                              d.y = y;
                              // Muevo la pieza a la posicion dada
                              d3.select(this)
                                    .attr("x", x * cell_size + cell_size * 0.1)
                                    .attr("y", y * cell_size + cell_size * 0.1);
                              // c1 = c1
                              // c2 = c2
                              highlight_path(Math.min(c1.idx, c2.idx), Math.max(c1.idx, c2.idx));
                              return;
                        }
                  }
                  d3.select(this).remove();
            }

            // Handler de drag and drop
            var dragHandler = d3.drag()
                  .on("start", drag_start)
                  .on("drag", drag_drag)
                  .on("end", drag_end);

            // Crea un domino
            function create_domino(direction) {
                  if (direction == 'v') {
                        board_container.append("use")
                              .datum({ direction: 'v', original: true, dx: 0, dy: 0, x: -1, y: -1 })
                              .attr("href", "#v_domino")
                              .attr("x", WIDTH1)
                              .attr("y", cell_size * 0.1)
                              .attr("fill", "rgb(255, 77, 166)")
                              .attr("class", "original")
                              .attr("stroke-width", "1px")
                              .call(dragHandler);
                  }
                  else {
                        board_container.append("use")
                              .datum({ direction: 'h', original: true, dx: 0, dy: 0, x: -1, y: -1 })
                              .attr("href", "#h_domino")
                              .attr("x", WIDTH1)
                              .attr("y", cell_size * 2.1)
                              .attr("fill", "rgb(255, 77, 166)")
                              .attr("class", "horizontal")
                              .attr("stroke-width", "1px")
                              .call(dragHandler);
                  }
            }

            create_domino('v');
            create_domino('h');

            function place_domino(i1, j1, i2, j2) {
                  if (i1 == i2 - 1) { //vertical

                  } else { // horizontal
                  }
            }

            function flatten(arr) {
                  return [].concat(...arr);
            }

            const nrows = board_rows;
            const ncolumns = board_cols;

            const matrix = new Array(nrows);
            for (let i = 0; i < nrows; i++) {
                  matrix[i] = new Array(ncolumns);
                  for (let j = 0; j < ncolumns; j++) {
                        matrix[i][j] = { x: i, y: j, active: grid[i][j].active };
                  }
            }
            // matrix[0][1].active = false;
            // matrix[2][2].active = false;

            // matrix = grid;

            for (let i = 0; i < nrows; i++) {
                  for (let j = 0; j < ncolumns; j++) {
                        let idx = i * ncolumns + j;
                        matrix[i][j].idx = idx;
                        matrix[i][j].gy = idx % 2;
                        matrix[i][j].gx = Math.floor(idx / 2);
                        matrix[i][j].links = []
                  }
            }

            const cells = flatten(matrix);
            let links1 = [];
            for (let i = 0; i < cells.length; i++) {
                  let source = cells[i];
                  if (source.x < nrows - 1) {
                        let target = matrix[source.x + 1][source.y];
                        let link = { source, target, key: source.idx * ncolumns * nrows + target.idx };
                        links1.push(link);
                        source.links.push(link);
                        target.links.push(link);
                  }
                  if (source.y < ncolumns - 1) {
                        let target = matrix[source.x][source.y + 1];
                        let link = { source, target, key: source.idx * ncolumns * nrows + target.idx };
                        links1.push(link);
                        source.links.push(link);
                        target.links.push(link);
                  }
            }

            class Graph {
                  constructor(n) {
                        this.N = n;
                        this.graph = [];
                        this.h = [];
                        this.e = [];
                        this.active = [];
                        this.s = 0;
                        this.t = n - 1;
                        this.fifo = [];
                        for (let i = 0; i < this.N; i++) {
                              this.graph.push(new Object());
                        }
                        for (let idx = 0; idx < this.N; idx++) {
                              this.h.push(0);
                              this.e.push(0);
                              this.active.push(false);
                        }
                  }

                  add_edge(u, v, cap) {
                        this.graph[u][v] = cap;
                        this.graph[v][u] = 0;
                  }

                  async bfs() {
                        operation_label.text(`Operacion: InitializePreflow`);
                        let closed = [];
                        for (let i = 0; i < this.n; i++) {
                              closed.push(false);
                        }
                        let queue = [[this.t, 0]];
                        closed[this.t] = true;
                        while (queue.length > 0) {
                              let [v, h] = queue.shift();
                              this.h[v] = h;
                              highlight_node(v);
                              move_node(v, h);
                              await sleep(durations);
                              unhighlight_node(v);
                              for (let u of Object.keys(this.graph[v])) {
                                    if (!closed[u] && this.graph[u][v] > 0) {
                                          closed[u] = true;
                                          queue.push([u, h + 1]);
                                    }
                              }
                        }
                  }

                  async initialize_preflow() {
                        operation_label.text(`Operacion: InitializePreflow`);
                        this.h[this.s] = this.N;
                        highlight_node(this.s);
                        move_node(this.s, this.N);
                        await sleep(durations);
                        unhighlight_node(this.s);
                        highlight_node(this.s);
                        for (let entry of Object.entries(this.graph[this.s])) {
                              let v = +entry[0];
                              let c = entry[1];
                              if (c == 0) {
                                    continue;
                              }


                              this.fifo.push(v);
                              this.active[v] = true;
                              this.graph[this.s][v] -= c;
                              this.graph[v][this.s] += c;
                              this.e[v] += c;
                              this.e[this.s] -= c;
                              highlight_node(v);
                              change_color(v, this.e[v]);
                              change_opacity(this.s, v, 0);
                              change_opacity(v, this.s, 1);
                              await sleep(durations);
                              unhighlight_node(v);
                        };
                        unhighlight_node(this.s);
                  }

                  async push(u, v) {
                        operation_label.text(`Operacion: Push(${u},${v})`);
                        assert(this.e[u] > 0, "push 1");
                        assert(this.graph[u][v] > 0, "push 2");
                        assert(this.h[u] == this.h[v] + 1, "push 3");
                        let delta = Math.min(this.e[u], this.graph[u][v]);
                        this.graph[u][v] -= delta;
                        this.graph[v][u] += delta;
                        this.e[u] -= delta;
                        this.e[v] += delta;

                        highlight_node(u);
                        highlight_node(v);
                        change_color(u, this.e[u]);
                        change_color(v, this.e[v]);
                        change_opacity(u, v, 0);
                        change_opacity(v, u, 1);
                        await sleep(durations);
                        if (v = this.t) {
                              excess_flow_label.text(`Exceso de flujo del sumidero: ${this.e[v]}`);
                        }
                        unhighlight_node(u);
                        unhighlight_node(v);

                        assert(u == this.s || this.e[u] >= 0, "push 4");
                        assert(v == this.s || this.e[v] >= 0, "push 5");
                  }

                  async relabel(u) {
                        operation_label.text(`Operacion: Relabel(${u})`);
                        assert(this.e[u] > 0, "relabel 1");
                        let m = 3 * this.N;
                        for (let entry of Object.entries(this.graph[u])) {
                              let v = +entry[0];
                              let c = entry[1];
                              if (c == 0) {
                                    continue;
                              }
                              if (this.h[v] < m) {
                                    m = this.h[v];
                              }
                        };
                        assert(this.h[u] <= m, "relabel 2");
                        this.h[u] = m + 1;
                        highlight_node(u);
                        move_node(u, this.h[u]);
                        await sleep(durations);
                        unhighlight_node(u);
                  }

                  async max_flow() {
                        await this.initialize_preflow();
                        while (this.fifo.length > 0) {
                              let u = this.fifo.shift();
                              this.active[u] = false;
                              highlight_node(u);
                              for (let entry of Object.entries(this.graph[u])) {
                                    let v = +entry[0];
                                    let c = entry[1];
                                    if (c == 0) {
                                          continue;
                                    }
                                    if (this.h[v] == this.h[u] - 1) {
                                          await this.push(u, v);
                                          if (v != this.s && v != this.t && !this.active[v]) {
                                                this.active[v] = true;
                                                this.fifo.push(v);
                                          }
                                          if (this.e[u] == 0) {
                                                break;
                                          }
                                    }
                              }
                              if (this.e[u] > 0) {
                                    await this.relabel(u);
                                    this.fifo.push(u);
                                    this.active[u] = true;
                              }
                        }
                        operation_label.text(`Operacion: `);
                        return this.e[this.t];
                  }
            }

            const N = 10;
            const durations = 800;
            const s = 0;
            const t = N - 1;

            newgraph = new Graph(N);
            newgraph.add_edge(0, 1, 1);
            newgraph.add_edge(0, 3, 1);
            newgraph.add_edge(0, 5, 1);
            newgraph.add_edge(0, 7, 1);
            newgraph.add_edge(2, t, 1);
            newgraph.add_edge(4, t, 1);
            newgraph.add_edge(6, t, 1);
            newgraph.add_edge(8, t, 1);
            newgraph.add_edge(1, 2, 1);
            newgraph.add_edge(3, 2, 1);
            newgraph.add_edge(5, 2, 1);
            newgraph.add_edge(5, 4, 1);
            newgraph.add_edge(5, 6, 1);
            newgraph.add_edge(5, 8, 1);
            newgraph.add_edge(7, 6, 1);

            const graph = newgraph.graph;
            let H = newgraph.h;

            const xf_color = [d3.interpolateRdYlGn(1), d3.interpolateRdYlGn(0.75),
            d3.interpolateRdYlGn(0.5), d3.interpolateRdYlGn(0.25),
            d3.interpolateRdYlGn(0), "rgb(0,0,255)"];
            const text_color = ["RGB(255,255,255)", "RGB(0,0,0)", "RGB(0,0,0)",
                  "RGB(0,0,0)", "RGB(255,255,255)"]

            const legend_data = [];
            for (let i = 0; i < 5; i++) {
                  legend_data.push({ color: xf_color[i], text_color: text_color[i], i })
            }

            // Margen de la visualizacion
            const MARGIN = { top: 40, right: 10, bottom: 80, left: 40 };

            // Ancho del total
            const WIDTH = 975;

            // Alto se calcula segun el tamanio de los nodos
            const node_box_size = (WIDTH - MARGIN.left - MARGIN.right) / (2 * N);
            const HEIGHT = MARGIN.top + MARGIN.bottom + node_box_size * N;
            const circle_radius = node_box_size / 4;

            // Tomo el svg
            const svg = d3.select("#container5-levels")
                  .attr("width", WIDTH)
                  .attr("height", HEIGHT)

            // Creo el grupo para el grafico
            svg.html("");
            const container = svg.append("g")
                  .attr("class", "levels_container")

            const defs = container.append("svg:defs");
            idx_colors = [["triangle10", "rgb(135, 214, 155)"],
            ["triangle10-highlighted10", "rgb(0, 0, 0)"]];
            for (tuple of idx_colors) {
                  defs.append("svg:marker")
                        .attr("id", tuple[0])
                        .attr("refX", 1 * circle_radius)
                        .attr("refY", 2.5)
                        .attr("markerWidth", 30)
                        .attr("markerHeight", 30)
                        .attr("orient", "auto")
                        .append("path")
                        .attr("d", "M 0 0 5 2.5 0 5 1.25 2.5")
                        .style("fill", tuple[1]);
            }

            // Dimensiones sin el margen
            const container_width = WIDTH - MARGIN.left - MARGIN.right;
            const container_height = HEIGHT - MARGIN.top - MARGIN.bottom;

            const legend = container.append("g")

            legend.append("text")
                  .attr("x", 70)
                  .attr("y", 15)
                  .style("fill", "black")
                  .text("Exceso de flujo:")
                  .raise();

            legend_containers = legend.selectAll(".rect")
                  .data(legend_data, d => d.color)
                  .enter()
                  .append("g")
                  .attr("transform", d => `translate(${d.i * 20 + MARGIN.left + 100}, ${0})`)

            legend_containers.append("rect")
                  .attr("class", "rect")
                  .attr("height", 20)
                  .attr("width", 20)
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("fill", d => d.color);

            legend_containers.append("text")
                  .attr("x", 10)
                  .attr("y", 15)
                  .style("fill", d => d.text_color)
                  .text(d => d.i)
                  .raise();


            const xScale = d3.scaleLinear()
                  .domain([0, 16])
                  .range([MARGIN.left + 0.5 * circle_radius, MARGIN.left + container_width - 0.5 * circle_radius]);

            const yScale = d3.scaleLinear()
                  .domain([0, N - 1])
                  .range([MARGIN.top + 0.5 * circle_radius, MARGIN.top + container_height - 0.5 * circle_radius - 10]);

            let node_data = new Array();
            // Creo arreglo de ids
            for (let i = 0; i < N; i++) {
                  let x = H[i];
                  let in_links = new Array();
                  let out_links = new Array();
                  node_data.push({ idx: i, h: x, in_links, out_links });
            }

            let link_data = new Array();
            let index_by_key = {};
            // Creo arreglo de ids
            let index = 0;
            for (let source_id = 0; source_id < N; source_id++) {
                  for (let entry of Object.entries(graph[source_id])) {
                        let source = node_data[source_id];
                        let target = node_data[entry[0]];
                        let key = source_id * N + parseInt(entry[0]);
                        let l = { source: source, target: target, active: entry[1], key };
                        link_data.push(l);
                        source.out_links.push(l);
                        target.in_links.push(l);
                        index_by_key[key] = index;
                        index += 1;
                  }
            }

            const links = container.selectAll(".link")
                  .data(link_data, link => link.key)
                  .enter()
                  .append("line")
                  .attr("class", "link")
                  .attr("x1", link => xScale(link.source.h))
                  .attr("y1", link => yScale(link.source.idx))
                  .attr("x2", link => xScale(link.target.h))
                  .attr("y2", link => yScale(link.target.idx))
                  .style("opacity", link => link.active ? 1 : 0)
                  .attr("marker-end", "url(#triangle10)");

            // Agrego nodos al html
            const nodes = container.selectAll(".node")
                  .data(node_data, info => info.idx)
                  .enter()
                  .append("g")
                  .attr("class", "node")
                  .attr("transform", d => `translate(${xScale(d.h)},${yScale(d.idx)})`)
                  .attr("width", node_box_size)
                  .attr("height", node_box_size);

            nodes.append("circle")
                  .attr("r", circle_radius)
                  .style("fill", d3.interpolateRdYlGn(1));

            // nodes.append("text")
            //     .attr("y", 5)
            //     .style("fill", "white")
            //     .text(d => d.idx)
            //     .raise();

            const axis_group = container.append("g");


            const axisBottom = d3.axisBottom(xScale)
                  .tickPadding(10)
                  .ticks(2 * N);

            axis_group.append("g")
                  .attr("class", "axis")
                  .attr("transform", `translate(${0}, ${container_height + MARGIN.top})`)
                  .call(axisBottom);

            const axisLeft = d3.axisLeft(yScale)
                  .tickPadding(10)
                  .ticks(N - 1);

            axis_group.append("g")
                  .attr("class", "axis")
                  .attr("transform", `translate(${30}, ${0})`)
                  .call(axisLeft);

            // nombres de los ejes
            container
                  .append("text")
                  .text("height")
                  .attr("x", xScale(15.5))
                  .attr("y", yScale(N + 0.2))
                  .style("font-size", 13)
                  .attr("text-anchor", "middle")
                  .style("fill", "black")
                  .raise();

            container
                  .append("text")
                  .text("node id")
                  .attr("x", xScale(-0.3))
                  .attr("y", yScale(-0.3))
                  .style("font-size", 13)
                  .attr("text-anchor", "middle")
                  .style("fill", "black")
                  .raise();

            let excess_flow_label = container.append("text")
                  .text("Exceso de flujo del sumidero: 0")
                  .attr("x", xScale(0.5))
                  .attr("y", yScale(t + 0.1))
                  .style("font-size", 13)
                  .style("text-anchor", "start")
                  .style("fill", "black")
                  .raise();

            let operation_label = container.append("text")
                  .text("Operacion: ")
                  .attr("x", xScale(0))
                  .attr("y", yScale(N + 0.2))
                  .style("font-size", 13)
                  .style("text-anchor", "start")
                  .style("fill", "black")
                  .raise();

            // axis_group.append("line")
            //       .attr("class", "x_axis")
            //       .attr("x1", MARGIN.left)
            //       .attr("y1", MARGIN.top + container_height)
            //       .attr("x2", MARGIN.left + container_width)
            //       .attr("y2", MARGIN.top + container_height)
            //       .style("")

            function move_node(i, h) {
                  node_data[i].h = h;
                  container.selectAll(".node")
                        .data([node_data[i]], info => info.idx)
                        .transition()
                        .duration(500)
                        .attr("transform", d => `translate(${xScale(d.h)},${yScale(d.idx)})`);
                  container.selectAll(".link")
                        .data(node_data[i].in_links, link => link.key)
                        .transition()
                        .duration(500)
                        .attr("x2", xScale(h))
                  container.selectAll(".link")
                        .data(node_data[i].out_links, link => { return link.key })
                        .transition()
                        .duration(500)
                        .attr("x1", xScale(h))
            }

            function move_node_instant(i, h) {
                  node_data[i].h = h;
                  container.selectAll(".node")
                        .data([node_data[i]], info => info.idx)
                        .attr("transform", d => `translate(${xScale(d.h)},${yScale(d.idx)})`);
                  container.selectAll(".link")
                        .data(node_data[i].in_links, link => link.key)
                        .attr("x2", xScale(h))
                  container.selectAll(".link")
                        .data(node_data[i].out_links, link => { return link.key })
                        .attr("x1", xScale(h))
            }

            function change_color(i, color_n) {
                  if (i == s || i == t) {
                        return;
                  }
                  let n = container.selectAll(".node")
                        .data([node_data[i]], info => info.idx);
                  n.select("circle")
                        .transition()
                        .duration(500)
                        .style("fill", xf_color[color_n]);
                  n.select("text")
                        .style("fill", text_color[color_n]);
            }

            function change_color_instant(i, color_n) {
                  if ((i == s || i == t) && color_n != 5) {
                        return;
                  }
                  let n = container.selectAll(".node")
                        .data([node_data[i]], info => info.idx);
                  n.select("circle")
                        .style("fill", xf_color[color_n]);
                  n.select("text")
                        .style("fill", text_color[color_n]);
            }

            function change_opacity_instant(i, j, opacity) {
                  let key = i * N + j;
                  container.selectAll(".link")
                        .data([link_data[index_by_key[key]]], link => link.key)
                        .style("opacity", opacity);
            }

            function change_opacity(i, j, opacity) {
                  let key = i * N + j;
                  container.selectAll(".link")
                        .data([link_data[index_by_key[key]]], link => link.key)
                        .transition()
                        .duration(500)
                        .style("opacity", opacity);
            }

            function highlight_node(i) {
                  container.selectAll(".node")
                        .data([node_data[i]], info => info.idx)
                        .select("circle")
                        .style("stroke", "black");
            }

            function unhighlight_node(i) {
                  container.selectAll(".node")
                        .data([node_data[i]], info => info.idx)
                        .select("circle")
                        .style("stroke", null);
            }

            function highlight_link(i, j) {
                  let key = i * N + j;
                  container.selectAll(".link")
                        .data([link_data[index_by_key[key]]], link => link.key)
                        .style("stroke", "black")
                        .attr("marker-end", "url(#triangle10-highlighted10)");
            }

            function unhighlight_link(i, j) {
                  let key = i * N + j;
                  container.selectAll(".link")
                        .data([link_data[index_by_key[key]]], link => link.key)
                        .style("stroke", null)
                        .attr("marker-end", "url(#triangle10)");
            }

            for (let i = 0; i < N; i++) {
                  move_node_instant(i, 0);
                  change_color_instant(i, 0);
            }
            change_color_instant(s, 5);
            change_color_instant(t, 5);

            await newgraph.bfs();
            await newgraph.max_flow();
      }

      async function loop10() {
            while (true) {
                  await vis10();
                  await sleep(3000);
            }
      }

      loop10()
}

vis10aux();