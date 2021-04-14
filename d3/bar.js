const dataUrl = 'https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/vgsales_clean_2.csv'

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

const barChart = ({data, chartKey, x, y, isClickable, onMouseOver, onMouseLeave, onClick}) => {
  // bar chart time!
  // first, some housekeeping
  const margin = ({top: 30, right: 30, bottom: 10, left: 500})
  const width = 1000
  const height = 300
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[x])])
    .range([margin.left, width - margin.right])
  const yScale = d3.scaleBand()
    .domain(d3.range(data.length))
    .rangeRound([margin.top, height - margin.bottom])
    .padding(0.1)
  const colorScale = d3.scaleOrdinal()
    .domain(data.map(d => d[y]))
    .range(d3.schemeTableau10)
  
  const format = xScale.tickFormat(20, data.format)
  const xAxis = g => g
    .attr('transform', `translate(0, ${margin.top})`)
    .call(d3.axisTop(xScale).ticks(width / 80, data.format))
    .call(g => g.select('.domain').remove())
  const yAxis = g => g
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat(i => data[i].name).tickSizeOuter(0))

  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
  
  svg.append('g')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', xScale(0))
    .attr('y', (d, i) => yScale(i))
    .attr('width', d => xScale(d.value) - xScale(0))
    .attr('height', yScale.bandwidth())
    .attr('fill', d => colorScale(d.name))
    .attr('class', `bar-${chartKey}`)
    .attr('id', d => `bar-${chartKey}-${d.index}`)
    .on('mouseover', (e, d) => {
      onMouseOver(d)
    })
    .on('mouseleave', (e, d) => {
      onMouseLeave(d)
    })
    .on('click', (event, d) => {
      onClick(d)
    })

  // add text labels to bar chart
  svg.append("g")
      .attr("fill", "white")
      .attr("text-anchor", "end")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
    .selectAll("text")
    .data(data)
    .join("text")
      .attr("x", d => xScale(d.value))
      .attr("y", (d, i) => yScale(i) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("dx", -4)
      .attr("font-weight", "bold")
      .text(d => format(d.value))
    .call(text => text.filter(d => xScale(d.value) - xScale(0) < 20) // short bars
      .attr("dx", +4)
      .attr("fill", "black")
      .attr("text-anchor", "start"));
  
  svg.append('g')
    .call(xAxis)
  
  svg.append('g')
    .call(yAxis)
    .style('font-size', '16px')

  return { svg, colorScale }
}

const sumByCol = (data, groupCol, dataCol) => {
  const result = {}
  data.forEach(d => {
    const group = d[groupCol]
    const value = d[dataCol]
    if (group in result) {
      result[group] += value
    } else {
      result[group] = value
    }
  })

  // convert to list of name, value, index objects
  const resultArray = Object.keys(result)
    .map(group => ({
      name: group,
      value: result[group],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map((vals, i) => ({
      ...vals,
      index: i,
    }))
  
  return resultArray
}

d3.csv(dataUrl, d3.autoType).then(data => {
  // TODO these will be passed to me from others
  const startYear = 2002
  const endYear = 2012
  const genres = ['Action', 'Adventure', 'Puzzle']

  // filter the data
  const dataFilt = data.filter(d => {
    return startYear <= d.Year && d.Year <= endYear && genres.indexOf(d.Genre) > -1
  })

  // aggregate
  let publisherSalesData = sumByCol(dataFilt, 'Publisher', 'Global_Sales')
  
  const width = 800
  const height = 800

  // pack the data
  const pack = data => d3.pack()
    .size([width - 2, height - 2])
    .padding(3)
  (d3.hierarchy({children: data})
    .sum(d => d.value))
  
  // set up elements
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('font-size', 12)
    .attr('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
  
  
  
  document.getElementById('bubble').appendChild(svg.node())

  let selectedPublisher = null

  const dataJoinBubbleChart = () => {
    // filter
    const dataFilt = data.filter(d => !selectedPublisher || (d.Publisher == selectedPublisher.name))
    const gameSalesData = sumByCol(dataFilt, 'Name', 'Global_Sales')

    // color by name
    const color = d3.scaleOrdinal(gameSalesData.map(d => d.name), d3.schemeSet3)

    // repack and run
    const root = pack(gameSalesData)
    const leaves = root.leaves()
    console.log(leaves, 'leaves')

    const t = svg.transition()
    .duration(750);

    const leaf = svg.selectAll('g')
      .data(leaves)
      .join(
        enter => {
          enter = enter.append('g')
          .call(enter => enter.transition(t)
            .attr('transform', d => `translate(${d.x + 1}, ${d.y + 1})`))
          
            enter.append('circle')
            .attr("r", d => d.r)
            .attr("fill-opacity", 0.7)
            .attr("fill", d => color(d.data.name))
          
            enter.append("clipPath")
        // .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
      .append("use")
        // .attr("xlink:href", d => d.leafUid.href);
          
          enter.append("text")
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
          
          return enter
        },
        update => {
          update
            .call(update => update.transition(t)
              .attr('transform', d => `translate(${d.x + 1}, ${d.y + 1})`))
          
          update.select('circle')
          .call(update => update.transition(t)
              .attr("r", d => d.r)
              .attr("fill-opacity", 0.7)
              .attr("fill", d => color(d.data.name)))
            
              update.select("text")
              
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
            },
        exit => exit.remove()
    )

    console.log(svg.selectAll('g'), 'ooo')
    console.log(leaf)
    
    // leaf
    //   .data(leaves, d => {console.log(d, 'jack'); return d;})
    //   .join(
    //     enter => enter.append('circle')
    //   )
          // .append('circle')
          // .attr("r", d => d.r)
          // .attr("fill-opacity", 0.7)
          // .attr("fill", d => color(d.data.name))
      // .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
      // .data(leaves, d => d.data.name)
      // .join(
      //   enter => enter.append('circle')
            
      //       .attr("r", d => d.r)
      //       .attr("fill-opacity", 0.7)
      //       .attr("fill", d => {console.log(d, '!!!'); return color(d.data.name)})
      //     .call(enter => enter.transition(t)
            
      //     ).call(enter => console.log(enter, '!!!dlfjsl')),
      //   update => update
          
      //     .attr("r", d => d.r)
      //     .attr("fill-opacity", 0.7)
      //     .attr("fill", d => color(d.data.name))
      //     .call(update => update.transition(t)
      //     .call(update => console.log(update))
      //   ),
      //   exit => exit.remove()
      //       )

    // leaf.append("clipPath")
    //     // .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
    //   .append("use")
    //     // .attr("xlink:href", d => d.leafUid.href);

    // leaf.append("text")
    //     // .attr("clip-path", d => d.clipUid)
    //   .selectAll("tspan")
    //   .data(d => d)
    //   // .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
    //   .join("tspan")
    //     .attr("x", 0)
    //     .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
    //     .attr('font-size', '16px')
    //     .text(d => d.data.name)
    //     .call(wrap, 100)

    // leaf.append("title")
    //     .text(d => `${d.data.title === undefined ? "" : `${d.data.title}
    //       `}${d.value}`);
  }

  dataJoinBubbleChart()
  
  // publisher chart
  const publisherOnMouseOver = d => {
    d3.selectAll('.bar-publisher')
      .transition()
    d3.selectAll('.bar-publisher')
      .filter(d => ! selectedPublisher || (selectedPublisher && selectedPublisher.index !== d.index))
      .style('opacity', 0.3)
    d3.selectAll(`#bar-publisher-${d.index}`)
      .style('opacity', 1)
      .style('cursor', 'pointer')
  }
  const publisherOnMouseLeave = d => {
    d3.selectAll('.bar-publisher')
      .transition()
      .delay(100)
      .style('opacity', 1)
    if (selectedPublisher) {
      d3.selectAll('.bar-publisher')
        .filter(d => selectedPublisher && selectedPublisher.index !== d.index)
        .transition()
        .delay(100)
        .style('opacity', 0.3)
    }
  }
  const publisherOnClick = d => {
    selectedPublisher = d
    d3.selectAll('#selected')
      .text(d.name)
      .style('color', colorScale(selectedPublisher.name))
      .text(selectedPublisher.name)
    d3.selectAll('.bar')
      .filter(d => selectedPublisher && selectedPublisher.index !== d.index)
      .style('opacity', 0.3)
    dataJoinBubbleChart()
  }
  const { svg: publisherChart, colorScale } = barChart({
    data: publisherSalesData,
    chartKey: 'publisher',
    x: 'value',
    y: 'name',
    isClickable: true,
    onMouseOver: publisherOnMouseOver,
    onMouseLeave: publisherOnMouseLeave,
    onClick: publisherOnClick,
  })

  // add button
  d3.select('#one')
    .append("input")
    .attr("type", "button")
    .attr("class", "button")
    .attr("value", "Reset")
    .on('click', () => {
      if (selectedPublisher) {
        selectedPublisher = null
        // reset all opacities
        d3.selectAll('.bar-publisher,.bar-game')
          .transition()
          .delay(100)
          .style('opacity', 1)
        
        // delete text
        d3.selectAll('.selected')
          .text('None')
          .style('color', 'black')
        
        // re-join
        dataJoinBubbleChart()
      }
    })
  
  document.getElementById('one').appendChild(publisherChart.node())

  d3.select('#one')
    .append('h1')
    .attr('id', 'selected')
    .attr('class', 'selected')
    .style('font-family', 'sans-serif')
    .text('None')
    .style('color', 'black')
})
