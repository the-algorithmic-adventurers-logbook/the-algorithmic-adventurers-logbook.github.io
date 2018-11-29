
function vis2() {
    // Margen del tablero
    const MARGIN = { top: 40, right: 10, bottom: 10, left: 10 };

    // Ancho del tablero (contado el margen)
    const WIDTH = 420;

    // Ancho del contenedor de dominos
    const domino_box_width2 = 200;

    // Ancho del svg
    const svg_width = WIDTH + domino_box_width2;

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
    const svg = d3.select("#board")
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
                matrix[row].push({ x: col, y: row, active: true, empty: true, idx: row * board_cols + col })
            }
        }
        return matrix;
    }

    // Creo la matrix
    const grid = createGrid(board_rows, board_cols);

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
        .enter();

    grid_cells.append("rect")
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
        .style("stroke_width", 0)
        .on("dblclick", change_active)
        .on("mouseover", highlight)
        .on("mouseout", unhighlight);

    grid_cells.append("text")
        .attr("x", d => (d.x + 0.5) * cell_size)
        .attr("y", d => (d.y + 0.55) * cell_size)
        .style("fill", "black")
        .text(d => d.idx)
        .raise()
    // .each(x => {
    // x.node().addEventListener('mousedown', e => e.preventDefault(), false);
    // });

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
                .attr("x", WIDTH)
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
                .attr("x", WIDTH)
                .attr("y", cell_size * 2.1)
                .attr("fill", "rgb(255, 77, 166)")
                .attr("class", "horizontal")
                .attr("stroke-width", "1px")
                .call(dragHandler);
        }
    }

    create_domino('v');
    create_domino('h');

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
            matrix[i][j] = { x: i, y: j, active: true };
        }
    }
    // matrix[0][1].active = false;
    // matrix[2][2].active = false;

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

    const container = d3.select("#container")
        .append("svg")
        .attr("width", WIDTH2)
        .attr("height", HEIGHT2)
        .append("g")
        .attr("transform",
            `translate(${MARGIN2.LEFT}, ${MARGIN2.TOP})`);

    // Links
    const linkcontainer = container.append("g");
    linkcontainer.selectAll(".node-link")
        .data(links, link => link.key)
        .enter()
        .append("line")
        .attr("class", "node-link")
        .attr("x1", link => (link.source.gy + 1) * SCALE * HORIZONTAL_SPACING)
        .attr("y1", link => link.source.gx * SCALE * VERTICAL_SPACING)
        .attr("x2", link => (link.target.gy + 1) * SCALE * HORIZONTAL_SPACING)
        .attr("y2", link => link.target.gx * SCALE * VERTICAL_SPACING)
        .style("visibility", link => link.source.active && link.target.active ? "visible" : "hidden");

    linkcontainer.selectAll(".source-link")
        .data(cells.filter(x => x.gy == 0), cell => cell.idx)
        .enter()
        .append("line")
        .attr("class", "source-link")
        .attr("x1", 0)
        .attr("y1", nrows * ncolumns / 4 * SCALE * VERTICAL_SPACING)
        .attr("x2", SCALE * HORIZONTAL_SPACING)
        .attr("y2", cell => cell.gx * SCALE * VERTICAL_SPACING)
        .style("visibility", cell => cell.active ? "visible" : "hidden");

    linkcontainer.selectAll(".sink-link")
        .data(cells.filter(x => x.gy == 1), cell => cell.idx)
        .enter()
        .append("line")
        .attr("class", "sink-link")
        .attr("x1", 3 * SCALE * HORIZONTAL_SPACING)
        .attr("y1", nrows * ncolumns / 4 * SCALE * VERTICAL_SPACING)
        .attr("x2", 2 * SCALE * HORIZONTAL_SPACING)
        .attr("y2", cell => cell.gx * SCALE * VERTICAL_SPACING)
        .style("visibility", cell => cell.active ? "visible" : "hidden");

    // Nodes
    let nodes = container.selectAll(".node")
        .data(cells, cell => cell.idx)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", cell => `translate(${(cell.gy + 1) * SCALE * HORIZONTAL_SPACING}, ${cell.gx * SCALE * VERTICAL_SPACING})`);

    nodes.append("circle")
        .attr("r", SCALE)
        .attr("class", cell => `circle-${cell.active ? "" : "in"}active`);

    nodes.append("text")
        .attr("y", 5)
        .style("fill", "black")
        .text(cell => cell.idx)
        .raise();


    // Source
    container.append("g")
        // .attr("class", "node")
        .append("circle")
        .attr("r", SCALE)
        .attr("class", "circle-active")
        .attr("transform", `translate(0, ${nrows * ncolumns / 4 * SCALE * VERTICAL_SPACING})`);

    // Sink
    container.append("g")
        // .attr("class", "node")
        .append("circle")
        .attr("r", SCALE)
        .attr("class", "circle-active")
        .attr("transform", `translate(${3 * SCALE * HORIZONTAL_SPACING}, ${nrows * ncolumns / 4 * SCALE * VERTICAL_SPACING})`);

    function highlight_node(idx) {
        container.selectAll(".node")
            .data([cells[idx]], cell => cell.idx)
            .select("circle")
            .style("stroke", "black")
            .style("stroke-width", "3px");
        linkcontainer.selectAll(".source-link")
            .data([cells[idx]], cell => cell.idx)
            .style("stroke", "black")
            .style("stroke-width", "3px");
        linkcontainer.selectAll(".sink-link")
            .data([cells[idx]], cell => cell.idx)
            .style("stroke", "black")
            .style("stroke-width", "3px");
        linkcontainer.selectAll(".node-link")
            .data(cells[idx].links, link => link.key)
            .style("stroke", "black")
            .style("stroke-width", "3px")
            .raise();
    }

    function unhighlight_node(idx) {
        container.selectAll(".node")
            .data([cells[idx]], cell => cell.idx)
            .select("circle")
            .style("stroke", "white")
            .style("stroke-width", null);
        linkcontainer.selectAll(".source-link")
            .data([cells[idx]], cell => cell.idx)
            .style("stroke", null)
            .style("stroke-width", null);
        linkcontainer.selectAll(".sink-link")
            .data([cells[idx]], cell => cell.idx)
            .style("stroke", null)
            .style("stroke-width", null);
        linkcontainer.selectAll(".node-link")
            .data(cells[idx].links, link => link.key)
            .style("stroke", null)
            .style("stroke-width", null)
            .lower();
    }

    function highlight_path(idx1, idx2) {
        let source = cells[Math.min(idx1, idx2)];
        let target = cells[Math.max(idx1, idx2)];
        container.selectAll(".node").data([source, target], cell=>cell.idx)
            .select("circle")
            .style("fill", "purple");
        let link = { source, target, key: source.idx * ncolumns * nrows + target.idx };
        let nodelink = linkcontainer.selectAll(".node-link")
            .data([link], link => link.key);
        if (nodelink.size() == 0) { return; }
        nodelink.style("stroke", "purple")
            .style("stroke-width", "4px").raise();
        linkcontainer.selectAll(".source-link")
            .data([source, target], cell => cell.idx)
            .style("stroke", "purple")
            .style("stroke-width", "4px")
            .raise();
        linkcontainer.selectAll(".sink-link")
            .data([source, target], cell => cell.idx)
            .style("stroke", "purple")
            .style("stroke-width", "4px")
            .raise();
    }

    function unhighlight_path(idx1, idx2) {
        let source = cells[Math.min(idx1, idx2)];
        let target = cells[Math.max(idx1, idx2)];
        container.selectAll(".node").data([source, target], cell=>cell.idx)
            .select("circle")
            .style("fill", null);
        let link = { source, target, key: source.idx * ncolumns * nrows + target.idx };
        let nodelink = linkcontainer.selectAll(".node-link")
            .data([link], link => link.key);
        if (nodelink.size() == 0) { return; }
        nodelink.style("stroke", null)
            .style("stroke-width", "2px");
        linkcontainer.selectAll(".source-link")
            .data([source, target], cell => cell.idx)
            .style("stroke", null)
            .style("stroke-width", "2px");
        linkcontainer.selectAll(".sink-link")
            .data([source, target], cell => cell.idx)
            .style("stroke", null)
            .style("stroke-width", "2px");
    }

    function disable_node(cell_idx) {
        let cell = cells[cell_idx];
        cell.active = false;
        container.selectAll(".node")
            .data([cell], cell => cell.idx)
            .select("circle")
            .attr("class", "circle-inactive");
        linkcontainer.selectAll(".source-link")
            .data([cell], cell => cell.idx)
            .style("visibility", "hidden");
        linkcontainer.selectAll(".sink-link")
            .data([cell], cell => cell.idx)
            .style("visibility", "hidden");
        linkcontainer.selectAll(".node-link")
            .data(cell.links, link => link.key)
            .style("visibility", "hidden");
    }

    function enable_node(cell_idx) {
        let cell = cells[cell_idx];
        cell.active = true;
        container.selectAll(".node")
            .data([cell], cell => cell.idx)
            .select("circle")
            .attr("class", "circle-active");
        linkcontainer.selectAll(".source-link")
            .data([cell], cell => cell.idx)
            .style("visibility", "visible");
        linkcontainer.selectAll(".sink-link")
            .data([cell], cell => cell.idx)
            .style("visibility", "visible");
        linkcontainer.selectAll(".node-link")
            .data(cell.links, link => link.key)
            .style("visibility", link => link.source.active && link.target.active ? "visible" : "hidden");
    }
}

vis2();