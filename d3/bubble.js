d3.csv(dataUrl, d3.autoType).then(data => {
  
  
  const width = 800
  const height = 800

  // pack the data
  const pack = data => d3.pack()
    .size([width - 2, height - 2])
    .padding(1)
  (d3.hierarchy({children: data})
    .sum(d => d.value))
  
  
  
  // set up elements
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('font-size', 12)
    .attr('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
  
  
  
  document.getElementById('bubble').appendChild(svg.node())

  // add button to affect data
  d3.select('#bubble')
    .append("input")
    .attr("type", "button")
    .attr("class", "button")
    .attr("value", "Switch")
    .on('click', () => {
      // select random publisher
      const publishers = Array.from(new Set(data.map(d => d.Publisher)))
      const randomPublisher = publishers[Math.floor(Math.random() * publishers.length)];

      // filter
      const dataFilt = data.filter(d => d.Publisher == randomPublisher)
      const gameSalesData = sumByCol(dataFilt, 'Name', 'Global_Sales')

      // color by name
      const color = d3.scaleOrdinal(gameSalesData.map(d => d.name), d3.schemeTableau10)

      // repack and run
      const root = pack(gameSalesData)

      const t = svg.transition()
        .duration(750);
      
      const leaf = svg.selectAll('g')
        .data(root.leaves(), d => d.data.name)
        .join(
          enter => enter.append('g')
            .call(enter => enter.transition(t)
              .attr('transform', d => `translate(${d.x + 1}, ${d.y + 1})`)),
          update => update
              .call(update => update.transition(t)
                .attr('transform', d => `translate(${d.x + 1}, ${d.y + 1})`)),
          exit => exit
                .call(exit => exit.remove())
        )
      
      leaf.append("circle")
        // .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
        .attr("r", d => d.r)
        .attr("fill-opacity", 0.7)
        .attr("fill", d => color(d.data.name));

      leaf.append("clipPath")
          // .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
        .append("use")
          // .attr("xlink:href", d => d.leafUid.href);
      
      function wrap(text, width) {
          text.each(function () {
              var text = d3.select(this),
                  words = text.text().split(/\s+/).reverse(),
                  word,
                  line = [],
                  lineNumber = 0,
                  lineHeight = 1.1, // ems
                  x = text.attr("x"),
                  y = text.attr("y"),
                  dy = 0, //parseFloat(text.attr("dy")),
                  tspan = text.text(null)
                              .append("tspan")
                              .attr("x", x)
                              .attr("y", y)
                              .attr("dy", dy + "em");
              while (word = words.pop()) {
                  line.push(word);
                  tspan.text(line.join(" "));
                  if (tspan.node().getComputedTextLength() > width) {
                      line.pop();
                      tspan.text(line.join(" "));
                      line = [word];
                      tspan = text.append("tspan")
                                  .attr("x", x)
                                  .attr("y", y)
                                  .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                  .text(word);
                  }
              }
          });
      }

      leaf.append("text")
          // .attr("clip-path", d => d.clipUid)
        .selectAll("tspan")
        .data(d => d)
        // .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
        .join("tspan")
          .attr("x", 0)
          .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
          .attr('font-size', '16px')
          .text(d => d.data.name)
          .call(wrap, 100)

      leaf.append("title")
          .text(d => `${d.data.title === undefined ? "" : `${d.data.title}
            `}${d.value}`);
    })
})