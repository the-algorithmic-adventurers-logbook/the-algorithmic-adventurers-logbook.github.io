
function assert(statement, s) {
    if (!statement) {
        throw s;
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

    bfs() {
        let closed = [];
        for (let i = 0; i < this.n; i++) {
            closed.push(false);
        }
        let queue = [[this.t, 0]];
        closed[this.t] = true;
        while (queue.length > 0) {
            let [v, h] = queue.shift();
            this.h[v] = h;
            for (let u of Object.keys(this.graph[v])) {
                if (!closed[u] && this.graph[u][v] > 0) {
                    closed[u] = true;
                    queue.push([u, h + 1]);
                }
            }
        }
    }

    initialize_preflow() {
        this.h[this.s] = this.N;
        for (let entry of Object.entries(this.graph[this.s])) {
            let v = entry[0];
            let c = entry[1];
            if (c == 0) {
                continue;
            }
            this.fifo.push(v);
            this.active[v] = true;
            this.graph[this.s][v] -= c;
            this.graph[v][this.s] += c;
            this.e[v] = c;
            this.e[this.s] -= c;
        };
    }

    push(u, v) {
        assert(this.e[u] > 0, "push 1");
        assert(this.graph[u][v] > 0, "push 2");
        assert(this.h[u] == this.h[v] + 1, "push 3");
        let delta = Math.min(this.e[u], this.graph[u][v]);
        this.graph[u][v] -= delta;
        this.graph[v][u] += delta;
        this.e[u] -= delta;
        this.e[v] += delta;
        assert(v == this.s || this.e[u] >= 0, "push 4");
        assert(v == this.s || this.e[v] >= 0, "push 5");
    }

    relabel(u) {
        assert(this.e[u] > 0, "relabel 1");
        let m = 3 * this.N;
        for (let entry of Object.entries(this.graph[u])) {
            let v = entry[0];
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
    }

    max_flow() {
        this.initialize_preflow();
        while (this.fifo.length > 0) {
            let u = this.fifo.shift();
            this.active[u] = false;
            for (let entry of Object.entries(this.graph[u])) {
                let v = entry[0];
                let c = entry[1];
                if (c == 0) {
                    continue;
                }
                if (this.h[v] == this.h[u] - 1) {
                    this.push(u, v);
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
                this.relabel(u);
                this.fifo.push(u);
                this.active[u] = true;
            }
        }
        return this.e[this.t];
    }
}

function vis5() {
    // Margen del tablero
    const MARGIN = { top: 40, right: 10, bottom: 10, left: 10 };

    // Ancho del tablero (contado el margen)
    const WIDTH = 420;

    // Ancho del contenedor de dominos
    const domino_box_width = 200;

    // Ancho del svg
    const svg_width = WIDTH + domino_box_width;

    // Cantidad de celdas horizontalmente y verticalmente
    const board_cols = 5;
    const board_rows = 5;

    // Tamanio de cada celda del tablero
    const cell_size = (WIDTH - MARGIN.left - MARGIN.right) / board_cols;

    // Seteo el alto y ancho de los dominos
    d3.select(".v_shape")
        .attr("width", cell_size * 0.8)
        .attr("height", 2 * cell_size * 0.9)
        .attr("rx", cell_size * 0.1)
    d3.select(".h_shape")
        .attr("height", cell_size * 0.8)
        .attr("width", 2 * cell_size * 0.9)
        .attr("rx", cell_size * 0.1)

    // Alto del tablero (contando el margen)
    const HEIGHT = cell_size * board_rows + MARGIN.top + MARGIN.bottom;

    // Alto y ancho del tablero sin contar el margen
    const board_width = WIDTH - MARGIN.left - MARGIN.right;
    const board_height = HEIGHT - MARGIN.top - MARGIN.bottom;

    // Tomo el svg
    const svg = d3.select("#board5")
        .attr("width", svg_width)
        .attr("height", HEIGHT)

    // Creo el grupo para el board para meter todo lo del tablero
    const board_container = svg.append("g")
        .attr("class", "board_container")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`)

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

    //////////////////////////////////

    const WIDTH2 = 350;
    const HEIGHT2 = 500;
    const MARGIN2 = { TOP: 20, BOTTOM: 20, LEFT: 20, RIGHT: 0 };
    const SCALE = 12;
    const HORIZONTAL_SPACING = 8;
    const VERTICAL_SPACING = 3;

    const width = WIDTH2 - MARGIN2.RIGHT - MARGIN2.LEFT;
    const height = HEIGHT2 - MARGIN2.TOP - MARGIN2.BOTTOM;

    const nrows = board_rows;
    const ncolumns = board_cols;

    function flatten(arr) {
        return [].concat(...arr);
    }

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
            matrix[i][j].links = [];
        }
    }

    const cells = flatten(matrix);
    let links = [];
    for (let i = 0; i < cells.length; i++) {
        let source = cells[i];
        if (source.x < nrows - 1) {
            let target = matrix[source.x + 1][source.y];
            let link = { source, target, key: source.idx * ncolumns * nrows + target.idx };
            links.push(link);
            source.links.push(link);
            target.links.push(link);
        }
        if (source.y < ncolumns - 1) {
            let target = matrix[source.x][source.y + 1];
            let link = { source, target, key: source.idx * ncolumns * nrows + target.idx };
            links.push(link);
            source.links.push(link);
            target.links.push(link);
        }
    }

    let graph = new Graph(4);
    graph.add_edge(0, 1, 2);
    graph.add_edge(1, 2, 2);
    graph.add_edge(2, 3, 2);
    graph.bfs();
    // console.log(graph);
    // console.log(graph.max_flow());
    // console.log(graph);

    // const container = d3.select("#container5")
    //     .append("svg")
    //     .attr("width", WIDTH2)
    //     .attr("height", HEIGHT2)
    //     .append("g")
    //     .attr("transform",
    //         `translate(${MARGIN2.LEFT}, ${MARGIN2.TOP})`);

    // // Links
    // const linkcontainer = container.append("g");
    // linkcontainer.selectAll(".node-link")
    //     .data(links, link => link.key)
    //     .enter()
    //     .append("line")
    //     .attr("class", "node-link")
    //     .attr("x1", link => (link.source.gy + 1) * SCALE * HORIZONTAL_SPACING)
    //     .attr("y1", link => link.source.gx * SCALE * VERTICAL_SPACING)
    //     .attr("x2", link => (link.target.gy + 1) * SCALE * HORIZONTAL_SPACING)
    //     .attr("y2", link => link.target.gx * SCALE * VERTICAL_SPACING)
    //     .style("visibility", link => link.source.active && link.target.active ? "visible" : "hidden");

    // linkcontainer.selectAll(".source-link")
    //     .data(cells.filter(x => x.gy == 0), cell => cell.idx)
    //     .enter()
    //     .append("line")
    //     .attr("class", "source-link")
    //     .attr("x1", 0)
    //     .attr("y1", nrows * ncolumns / 4 * SCALE * VERTICAL_SPACING)
    //     .attr("x2", SCALE * HORIZONTAL_SPACING)
    //     .attr("y2", cell => cell.gx * SCALE * VERTICAL_SPACING)
    //     .style("visibility", cell => cell.active ? "visible" : "hidden");

    // linkcontainer.selectAll(".sink-link")
    //     .data(cells.filter(x => x.gy == 1), cell => cell.idx)
    //     .enter()
    //     .append("line")
    //     .attr("class", "sink-link")
    //     .attr("x1", 3 * SCALE * HORIZONTAL_SPACING)
    //     .attr("y1", nrows * ncolumns / 4 * SCALE * VERTICAL_SPACING)
    //     .attr("x2", 2 * SCALE * HORIZONTAL_SPACING)
    //     .attr("y2", cell => cell.gx * SCALE * VERTICAL_SPACING)
    //     .style("visibility", cell => cell.active ? "visible" : "hidden");

    // // Nodes
    // let nodes = container.selectAll(".node")
    //     .data(cells, cell => cell.idx)
    //     .enter()
    //     .append("g")
    //     .attr("class", "node")
    //     .attr("transform", cell => `translate(${(cell.gy + 1) * SCALE * HORIZONTAL_SPACING}, ${cell.gx * SCALE * VERTICAL_SPACING})`);

    // nodes.append("circle")
    //     .attr("r", SCALE)
    //     .attr("class", cell => `circle-${cell.active ? "" : "in"}active`);

    // // Source
    // container.append("g")
    //     // .attr("class", "node")
    //     .append("circle")
    //     .attr("r", SCALE)
    //     .attr("class", "circle-active")
    //     .attr("transform", `translate(0, ${nrows * ncolumns / 4 * SCALE * VERTICAL_SPACING})`);

    // // Sink
    // container.append("g")
    //     // .attr("class", "node")
    //     .append("circle")
    //     .attr("r", SCALE)
    //     .attr("class", "circle-active")
    //     .attr("transform", `translate(${3 * SCALE * HORIZONTAL_SPACING}, ${nrows * ncolumns / 4 * SCALE * VERTICAL_SPACING})`);

    // function highlight_node(idx) {
    //     container.selectAll(".node")
    //         .data([cells[idx]], cell => cell.idx)
    //         .select("circle")
    //         .style("stroke", "black");
    //     linkcontainer.selectAll(".source-link")
    //         .data([cells[idx]], cell => cell.idx)
    //         .style("stroke", "black");
    //     linkcontainer.selectAll(".sink-link")
    //         .data([cells[idx]], cell => cell.idx)
    //         .style("stroke", "black");
    //     linkcontainer.selectAll(".node-link")
    //         .data(cells[idx].links, link => link.key)
    //         .style("stroke", "black")
    //         .raise();
    // }

    // function unhighlight_node(idx) {
    //     container.selectAll(".node")
    //         .data([cells[idx]], cell => cell.idx)
    //         .select("circle")
    //         .style("stroke", "white");
    //     linkcontainer.selectAll(".source-link")
    //         .data([cells[idx]], cell => cell.idx)
    //         .style("stroke", null);
    //     linkcontainer.selectAll(".sink-link")
    //         .data([cells[idx]], cell => cell.idx)
    //         .style("stroke", null);
    //     linkcontainer.selectAll(".node-link")
    //         .data(cells[idx].links, link => link.key)
    //         .style("stroke", null)
    //         .lower();
    // }

    // function highlight_path(idx1, idx2) {
    //     let source = cells[Math.min(idx1, idx2)];
    //     let target = cells[Math.max(idx1, idx2)];
    //     container.selectAll(".node").data([source, target], cell => cell.idx)
    //         .select("circle")
    //         .style("fill", "purple");
    //     let link = { source, target, key: source.idx * ncolumns * nrows + target.idx };
    //     let nodelink = linkcontainer.selectAll(".node-link")
    //         .data([link], link => link.key);
    //     if (nodelink.size() == 0) { return; }
    //     nodelink.style("stroke", "purple")
    //         .style("stroke-width", "4px").raise();
    //     linkcontainer.selectAll(".source-link")
    //         .data([source, target], cell => cell.idx)
    //         .style("stroke", "purple")
    //         .style("stroke-width", "4px")
    //         .raise();
    //     linkcontainer.selectAll(".sink-link")
    //         .data([source, target], cell => cell.idx)
    //         .style("stroke", "purple")
    //         .style("stroke-width", "4px")
    //         .raise();
    // }

    // function unhighlight_path(idx1, idx2) {
    //     let source = cells[Math.min(idx1, idx2)];
    //     let target = cells[Math.max(idx1, idx2)];
    //     container.selectAll(".node").data([source, target], cell => cell.idx)
    //         .select("circle")
    //         .style("fill", null);
    //     let link = { source, target, key: source.idx * ncolumns * nrows + target.idx };
    //     let nodelink = linkcontainer.selectAll(".node-link")
    //         .data([link], link => link.key);
    //     if (nodelink.size() == 0) { return; }
    //     nodelink.style("stroke", null)
    //         .style("stroke-width", "2px");
    //     linkcontainer.selectAll(".source-link")
    //         .data([source, target], cell => cell.idx)
    //         .style("stroke", null)
    //         .style("stroke-width", "2px");
    //     linkcontainer.selectAll(".sink-link")
    //         .data([source, target], cell => cell.idx)
    //         .style("stroke", null)
    //         .style("stroke-width", "2px");
    // }

    // function disable_node(cell_idx) {
    //     let cell = cells[cell_idx];
    //     cell.active = false;
    //     container.selectAll(".node")
    //         .data([cell], cell => cell.idx)
    //         .select("circle")
    //         .attr("class", "circle-inactive");
    //     linkcontainer.selectAll(".source-link")
    //         .data([cell], cell => cell.idx)
    //         .style("visibility", "hidden");
    //     linkcontainer.selectAll(".sink-link")
    //         .data([cell], cell => cell.idx)
    //         .style("visibility", "hidden");
    //     linkcontainer.selectAll(".node-link")
    //         .data(cell.links, link => link.key)
    //         .style("visibility", "hidden");
    // }

    // function enable_node(cell_idx) {
    //     let cell = cells[cell_idx];
    //     cell.active = true;
    //     container.selectAll(".node")
    //         .data([cell], cell => cell.idx)
    //         .select("circle")
    //         .attr("class", "circle-active");
    //     linkcontainer.selectAll(".source-link")
    //         .data([cell], cell => cell.idx)
    //         .style("visibility", "visible");
    //     linkcontainer.selectAll(".sink-link")
    //         .data([cell], cell => cell.idx)
    //         .style("visibility", "visible");
    //     linkcontainer.selectAll(".node-link")
    //         .data(cell.links, link => link.key)
    //         .style("visibility", link => link.source.active && link.target.active ? "visible" : "hidden");
    // }
}

vis5();