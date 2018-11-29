
function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
}

function assert(statement, s) {
      if (!statement) {
            throw s;
      }
}

function vis9aux() {
      async function vis9() {
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

            const N = 5;
            const durations = 1500;
            const s = 0;
            const t = N - 1;

            rgraph = new Graph(N);
            rgraph.add_edge(0, 1, 1);
            rgraph.add_edge(0, 2, 1);
            rgraph.add_edge(1, 3, 1);
            rgraph.add_edge(2, 3, 1);
            rgraph.add_edge(3, 4, 1);

            const graph = rgraph.graph;
            let H = rgraph.h;

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
            const MARGIN = { top: 40, right: 10, bottom: 50, left: 40 };

            // Ancho del total
            const WIDTH = 550;

            // Alto se calcula segun el tamanio de los nodos
            const node_box_size = (WIDTH - MARGIN.left - MARGIN.right) / (2 * N);
            const HEIGHT = MARGIN.top + MARGIN.bottom + node_box_size * N;
            const circle_radius = node_box_size / 4;

            // Tomo el svg
            const svg = d3.select("#main-loop-levels")
                  .attr("width", WIDTH)
                  .attr("height", HEIGHT)

            // Creo el grupo para el grafico
            svg.html("");
            const container = svg.append("g")
                  .attr("class", "levels_container")

            const defs = container.append("svg:defs");
            idx_colors = [["triangle", "rgb(135, 214, 155)"],
            ["triangle-highlighted", "rgb(0, 0, 0)"]];
            for (tuple of idx_colors) {
                  defs.append("svg:marker")
                        .attr("id", tuple[0])
                        .attr("refX", 0.95 * circle_radius)
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
                  .domain([0, 2 * N])
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
                  .attr("marker-end", "url(#triangle)");

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
                  .attr("x", xScale(2 * N - 0.5))
                  .attr("y", yScale(N))
                  .style("font-size", 13)
                  .attr("text-anchor", "middle")
                  .style("fill", "black")
                  .raise();

            container
                  .append("text")
                  .text("node id")
                  .attr("x", xScale(-0.3))
                  .attr("y", yScale(-0.2))
                  .style("font-size", 13)
                  .attr("text-anchor", "middle")
                  .style("fill", "black")
                  .raise();

            let excess_flow_label = container.append("text")
                  .text("Exceso de flujo del sumidero: 0")
                  .attr("x", xScale(0.5))
                  .attr("y", yScale(4.1))
                  .style("font-size", 13)
                  .style("text-anchor", "start")
                  .style("fill", "black")
                  .raise();

            let operation_label = container.append("text")
                  .text("Operación: ")
                  .attr("x", xScale(0))
                  .attr("y", yScale(N))
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
                        .attr("marker-end", "url(#triangle-highlighted)");
            }

            function unhighlight_link(i, j) {
                  let key = i * N + j;
                  container.selectAll(".link")
                        .data([link_data[index_by_key[key]]], link => link.key)
                        .style("stroke", null)
                        .attr("marker-end", "url(#triangle)");
            }

            for (let i = 0; i < N; i++) {
                  move_node_instant(i, 0);
                  change_color_instant(i, 0);
            }
            change_color_instant(s, 5);
            change_color_instant(t, 5);

            await rgraph.bfs();
            await rgraph.max_flow();
      }

      async function loop9() {
            while (true) {
                  await vis9();
                  await sleep(3000);
            }
      }

      loop9()
}
vis9aux();