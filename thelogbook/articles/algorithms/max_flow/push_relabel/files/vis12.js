
function vis12() {
    // Margen del tablero
    const MARGIN = { top: 40, right: 10, bottom: 10, left: 10 };

    // Ancho del tablero (contado el margen)
    const WIDTH = 270;

    // Ancho del contenedor de dominos
    const domino_box_width4 = 0;

    // Ancho del svg
    const svg_width = WIDTH + domino_box_width4;

    // Cantidad de celdas horizontalmente y verticalmente
    const board_cols = 5;
    const board_rows = 5;

    // Tamanio de cada celda del tablero
    const cell_size = (WIDTH - MARGIN.left - MARGIN.right) / board_cols;

    // Seteo el alto y ancho de los dominos
    d3.select(".v_shape12")
        .attr("width", cell_size * 0.8)
        .attr("height", 2 * cell_size * 0.9)
        .attr("rx", cell_size * 0.1)
    d3.select(".h_shape12")
        .attr("height", cell_size * 0.8)
        .attr("width", 2 * cell_size * 0.9)
        .attr("rx", cell_size * 0.1)

    // Alto del tablero (contando el margen)
    const HEIGHT = cell_size * board_rows + MARGIN.top + MARGIN.bottom;

    // Alto y ancho del tablero sin contar el margen
    const board_width = WIDTH - MARGIN.left - MARGIN.right;
    const board_height = HEIGHT - MARGIN.top - MARGIN.bottom;

    // Tomo el svg
    const svg = d3.select("#board12")
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
    // var dragHandler = d3.drag()
    //     .on("start", drag_start)
    //     .on("drag", drag_drag)
    //     .on("end", drag_end);

    // Crea un domino
    function create_domino(direction) {
        if (direction == 'v') {
            board_container.append("use")
                .datum({ direction: 'v', original: true, dx: 0, dy: 0, x: -1, y: -1 })
                .attr("href", "#v_domino12")
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
                .attr("href", "#h_domino12")
                .attr("x", WIDTH)
                .attr("y", cell_size * 2.1)
                .attr("fill", "rgb(255, 77, 166)")
                .attr("class", "horizontal")
                .attr("stroke-width", "1px")
                .call(dragHandler);
        }
    }
    board_container.append("use")
        .datum({ direction: 'v', original: true, dx: 0, dy: 0, x: -1, y: -1 })
        .attr("href", "#v_domino12")
        .attr("x", 1 * cell_size + cell_size * 0.1)
        .attr("y", 1 * cell_size + cell_size * 0.1)
        .attr("fill", "rgb(255, 77, 166)")
        .attr("class", "original")
        .attr("stroke-width", "1px")
    // .call(dragHandler);

    board_container.append("use")
        .datum({ direction: 'h', original: true, dx: 0, dy: 0, x: -1, y: -1 })
        .attr("href", "#h_domino12")
        .attr("x", 0 * cell_size + cell_size * 0.1)
        .attr("y", 3 * cell_size + cell_size * 0.1)
        .attr("fill", "rgb(255, 77, 166)")
        .attr("class", "original")
        .attr("stroke-width", "1px")
    // .call(dragHandler);

    board_container.append("use")
        .datum({ direction: 'h', original: true, dx: 0, dy: 0, x: -1, y: -1 })
        .attr("href", "#h_domino12")
        .attr("x", 2 * cell_size + cell_size * 0.1)
        .attr("y", 3 * cell_size + cell_size * 0.1)
        .attr("fill", "rgb(255, 77, 166)")
        .attr("class", "original")
        .attr("stroke-width", "1px")
    // .call(dragHandler);

    // create_domino('v');
    // create_domino('h');

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
}

vis12();