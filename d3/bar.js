const dataUrl = 'https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/vgsales_clean_2.csv'

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
  
  // publisher chart
  let selectedPublisher = null
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
      selectedPublisher = null
      selectedGame = null
      // reset all opacities
      d3.selectAll('.bar-publisher,.bar-game')
        .transition()
        .delay(100)
        .style('opacity', 1)
      
      // delete text
      d3.selectAll('.selected')
        .text('None')
        .style('color', 'black')
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