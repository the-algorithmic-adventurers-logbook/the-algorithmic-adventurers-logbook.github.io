
function vis6() {

      const N = 5;
      const durations = 500;
      const s = 0;
      const t = N - 1;
      const graph = [
            { 1: 1, 2: 1 },
            { 3: 1, 0: 0 },
            { 3: 0, 0: 0 },
            { 4: 0, 1: 0, 2: 1 },
            { 3: 1 },
      ];
      const H = [5, 2, 2, 1, 0];

      const xf_color = [d3.interpolateRdYlGn(1), d3.interpolateRdYlGn(0.75),
      d3.interpolateRdYlGn(0.5), d3.interpolateRdYlGn(0.25),
      d3.interpolateRdYlGn(0), "rgb(0,0,255)"]
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
      const svg = d3.select("#push-levels")
            .attr("width", WIDTH)
            .attr("height", HEIGHT)

      // Creo el grupo para el grafico
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
            .domain([0, 7])
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
            .ticks(8);

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
            .attr("x", xScale(6.5))
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
                  .duration(durations)
                  .attr("transform", d => `translate(${xScale(d.h)},${yScale(d.idx)})`);
            container.selectAll(".link")
                  .data(node_data[i].in_links, link => link.key)
                  .transition()
                  .duration(durations)
                  .attr("x2", xScale(h))
            container.selectAll(".link")
                  .data(node_data[i].out_links, link => { return link.key })
                  .transition()
                  .duration(durations)
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
                  .duration(durations)
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

      function change_opacity(i, j, opacity) {
            let key = i * N + j;
            container.selectAll(".link")
                  .data([link_data[index_by_key[key]]], link => link.key)
                  .transition()
                  .duration(durations)
                  .style("opacity", opacity);
      }

      function change_opacity_instant(i, j, opacity) {
            let key = i * N + j;
            container.selectAll(".link")
                  .data([link_data[index_by_key[key]]], link => link.key)
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

      function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
      }

      change_color_instant(s, 5);
      change_color_instant(t, 5);
      highlight_node(3);
      highlight_node(2);
      highlight_link(2, 3);
      highlight_link(3, 2);
      change_color_instant(3, 2);
      change_color_instant(1, 1);
      move_node_instant(3, 3);
      async function loop() {
            while (true) {
                  await sleep(2000);
                  change_color(3, 1);
                  change_color(2, 1);
                  change_opacity(3, 2, 0);
                  change_opacity(2, 3, 1);
                  await sleep(3000);
                  change_color_instant(3, 2);
                  change_color_instant(2, 0);
                  change_opacity_instant(3, 2, 1);
                  change_opacity_instant(2, 3, 0);
            }
      }
      loop();
}

vis6();
