const dataUrl = 'https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/vgsales_clean_2.csv'

d3.csv(dataUrl, d3.autoType).then(data => {
  // convert data to key and value format
  // let's sum sales by platform
  const platformSales = {}
  data.forEach(d => {
    const platform = d.Platform
    const sales = d.Global_Sales
    if (platform in platformSales) {
      platformSales[platform] += sales
    } else {
      platformSales[platform] = sales
    }
  })

  // convert to list of name, value objects
  const platformSalesData = Object.keys(platformSales)
    .map(platform => ({
      name: platform,
      value: platformSales[platform],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map((vals, i) => ({
      ...vals,
      index: i,
    }))

  // bar chart time!
  // first, some housekeeping
  const margin = ({top: 30, right: 30, bottom: 10, left: 150})
  const width = 700
  const height = 400
  const x = d3.scaleLinear()
    .domain([0, d3.max(platformSalesData, d => d.value)])
    .range([margin.left, width - margin.right])
  const y = d3.scaleBand()
    .domain(d3.range(platformSalesData.length))
    .rangeRound([margin.top, height - margin.bottom])
    .padding(0.1)
  const colorScale = d3.scaleOrdinal()
    .domain(platformSalesData.map(d => d.name))
    .range(d3.schemeTableau10)
  
    const format = x.tickFormat(20, platformSalesData.format)
  const xAxis = g => g
    .attr('transform', `translate(0, ${margin.top})`)
    .call(d3.axisTop(x).ticks(width / 80, platformSalesData.format))
    .call(g => g.select('.domain').remove())
  const yAxis = g => g
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y).tickFormat(i => platformSalesData[i].name).tickSizeOuter(0))

  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height])
  
  svg.append('g')
    .selectAll('rect')
    .data(platformSalesData)
    .join('rect')
    .attr('x', x(0))
    .attr('y', (d, i) => y(i))
    .attr('width', d => x(d.value) - x(0))
    .attr('height', y.bandwidth())
    .attr('fill', d => colorScale(d.name))
    .attr('class', 'bar')
    .attr('id', d => `bar-${d.index}`)
    .on('mouseover', (e, d) => {
      d3.selectAll('.bar')
        .transition()
      d3.selectAll('.bar')
        .style('opacity', 0.5)
      d3.selectAll(`#bar-${d.index}`)
        // .transition()
        // .delay(100)
        .style('opacity', 1)
    })
    .on('mouseleave', () => {
      d3.selectAll('.bar')
        .transition()
        .delay(100)
        .style('opacity', 1)
    })

  // handle dynamic opacity
  d3.select(`#bar`)

  // add text labels to bar chart
  svg.append("g")
      .attr("fill", "white")
      .attr("text-anchor", "end")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
    .selectAll("text")
    .data(platformSalesData)
    .join("text")
      .attr("x", d => x(d.value))
      .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("dx", -4)
      .attr("font-weight", "bold")
      .text(d => format(d.value))
    .call(text => text.filter(d => x(d.value) - x(0) < 20) // short bars
      .attr("dx", +4)
      .attr("fill", "black")
      .attr("text-anchor", "start"));
  
  svg.append('g')
    .call(xAxis)
  
  svg.append('g')
    .call(yAxis)

  // handle clicking
  svg.selectAll('.bar')
    .on('click', (event, d) => {
      console.log(d)
    })
  
  document.getElementById('one').appendChild(svg.node())
})