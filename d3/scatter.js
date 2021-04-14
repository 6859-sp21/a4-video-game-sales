// get data
const dataUrl = 'https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/vgsales_clean_2.csv'
d3.csv(dataUrl, d3.autoType).then(data => {
  console.log('data received', data.length);

  // Filtering our data to just certain publishers
  const publishers = ['THQ']
  const dataFiltPublishers = data.filter(d => publishers.indexOf(d.Publisher) > -1)

  // Need to sum by year
  const yearSums = {}
  dataFiltPublishers.forEach(({Year, Global_Sales}) => {
    if (Year in yearSums) {
      yearSums[Year] += Global_Sales
    } else {
      yearSums[Year] = +Global_Sales
    }
  })

  const dataFilt = Object.keys(yearSums).map(y => ({
    Year: y,
    Global_Sales: yearSums[y],
  }))
  console.log(dataFilt, 'filt')

  // Set up space
  const height = 420
  const width = 600
  const margin = {top: 10, right: 50, bottom: 20, left: 50}

  // Create svg object
  const svg = d3.create('svg')
    .attr('width', width)
    .attr('height', height)

  // Set up scales
  // TODO need an ordinal scale for X? Since Year?
  const xScale = d3.scaleLinear()
    .domain([d3.min(dataFilt, d => d.Year), d3.max(dataFilt, d => d.Year)])
    .range([margin.left, width - margin.right])
    .nice()

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataFilt, d => d.Global_Sales)])
    .range([height - margin.bottom, margin.top])
    .nice()
  
  const colorScale = d3.scaleOrdinal()
    .domain(data.map(d => d.Name))
    .range(d3.schemeTableau10)
  
  // Draw points
  const symbol = d3.symbol()
  const g = svg.append('g')
    .classed('marks', true)
  
  // Helper that tackles selection and color in the absence of a selection
  const getNameColor = d => {
    if (d.hasOwnProperty('selected') && ! d.selected) {
      return 'lightgray'
    }
    
    return colorScale(d.Name)
  }

  // Draw histogram
  const widthHisto = 420
  const heightHisto = 150
  const marginHisto = {top: 10, right: 0, bottom: 20, left: 150};
  
  const svgHisto = d3.create('svg')
    .attr('width', widthHisto)
    .attr('height', heightHisto)
  
  // Helper function to nicely aggregate the data to plot on the histogram
  // Gives us a list of key/value objects
  const aggregateHisto = d => d3.rollups(
    dataFilt.filter(d => ! d.hasOwnProperty('selected') || d.selected == true),
    vals => d3.sum(vals, d => d.Global_Sales),
    d => d.Name
  ).map(d => ({
    key: d[0],
    value: d[1],
  }))

  // Call our agg function
  const rawAggregate = aggregateHisto(dataFilt)

  // Set up histogram scales
  const xScaleHisto = d3.scaleLinear()
    .domain([0, d3.max(rawAggregate, d => d.value)])
    .range([marginHisto.left, widthHisto - marginHisto.right])
    .nice()
  
  const yScaleHisto = d3.scaleBand()
    .domain(rawAggregate.map(d => d.key))
    .range([heightHisto - marginHisto.bottom, marginHisto.top])
    .padding(0.1)
  
  svgHisto.append('g')
    .classed('y-axis', true)
    .attr('transform', `translate(${marginHisto.left}, 0)`)
    .call(d3.axisLeft(yScaleHisto).tickFormat((d, i) => 'TODO figure out name'))
  
  const gHist = svgHisto.append('g')
    .classed('marks', true)
  
  // histogram datajoin function
  const dataJoinHisto = (rawData = dataFilt) => {
    const data = aggregateHisto(rawData)

    gHist.selectAll('rect')
      .data(dataFilt)
      .join(
        enter => enter.append('rect')
            .attr('fill', d => colorScale(d.key))
            .attr('x', marginHisto.left)
            .attr('y', yScaleHisto(d.key))
            .attr('height', yScaleHisto.bandWidth())
          .call(enter => enter.transition().duration(1000)
            .attr('width', d => xScaleHisto(d.value) - marginHisto.left)
          ),
        update => update
          .attr('fill', d => colorScale(d.key))
          .attr('y', yScaleHisto(d.key))
          .call(update => update.transition().duration(200)
            .attr('width', d => xScaleHisto(d.value) - marginHisto.left)
          ),
        exit => exit
          .call(exit => exit.transition().duration(1000)
            .attr('width', d => xScaleHisto(0) - marginHisto.left)
            .remove())
      )
  }

  // scatter plot datajoin function
  const dataJoin = (rawData = dataFilt) => {
    g.selectAll('path')
        .data(rawData)
        .join('path')
          .classed('country', true) // can reference these marks like css, i.e. 'path.country'
          .attr('transform', d => `translate(${xScale(d.Year)}, ${yScale(d.Global_Sales)})`)
          .attr('fill', d => getNameColor(d))
          .attr('fill-opacity', 0.7)
          .attr('d', d => symbol())
  }

  // helper function to draw both scatter and histogram
  const chartsDataJoin = (rawData = dataFilt) => {
    dataJoin(rawData)
    dataJoinHisto(rawData)
  }

  // Draw x axis
  svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .append('text')
      .attr('text-anchor', 'end')
        .attr('fill', 'black')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('x', width - margin.right)
        .attr('y', -10)
        .text('Year')
    
  // Draw y axis
  svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale))
    .append('text')
      .attr('transform', `translate(20, ${margin.top}) rotate(-90)`)
      .attr('text-anchor', 'end')
      .attr('fill', 'black')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Global Sales (MM USD)');

  // add brush callback to handle brush event
  const brushed = event => {
    const coords = event.selection
    // assuming 2d brush for now: [[x0, y0], [x1, y1]]
    if (coords) {
      // destructure
      const [[x0, y0], [x1, y1]] = coords;

      // augment data with a field 'selected' which is set to true only for points within selection
      const brushedData = dataFilt.map(d => ({
        ...d,
        selected: x0 <= xScale(d.Year) && xScale(d.Year) < x1 && y0 <= yScale(d.Global_Sales) && yScale(d.Global_Sales) < y1
      }))

      // perform the data join with this augmented data
      chartsDataJoin(brushedData)
    }
  }
  
  // Add brush to alllow selecting a sub region
  const brush = d3.brush()
    .extent([[margin.left, 0], [width, height - margin.bottom]])
    .on('start brush end', brushed)

  svg.select('g.marks')
    .attr('class', 'brush')
    .call(brush)
  
  

  // add clear function on double click
  svg.on('dblclick', (event, d) => {
    chartsDataJoin(dataFilt)
  })

  // append our objects to the DOM!
  document.getElementById('chart').appendChild(svg.node())
  document.getElementById('chart').appendChild(svgHisto.node())

})