const dataUrl = 'https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/vgsales_clean_2.csv'
const genreDataUrl = "https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/aggregated_genre.csv"

const barChart = ({ data, chartKey, x, y, isClickable, onMouseOver, onMouseLeave, onClick }) => {
    // bar chart time!
    // first, some housekeeping
    const margin = ({ top: 30, right: 30, bottom: 10, left: 500 })
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

function genreArrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele != value;
    });
}

// Parse the Data
d3.csv(genreDataUrl).then((genreData) => {
    d3.csv(dataUrl, d3.autoType).then(data => {

        var startYear = 1980
        var endYear = 2020

        // set the dimensions and margins of the graph
        var margin = { top: 60, right: 230, bottom: 50, left: 100 },
            width = 1000 - margin.left - margin.right,
            height = 750 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#stacked_viz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var keys = genreData.columns.slice(2);
        console.log(keys)

        //////////
        // GENERAL //
        //////////

        var genreColorScheme = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab", "#882020", "#a3d677"];

        console.log(genreData.length);

        // color palette
        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(genreColorScheme);

        //stack the data?
        var stackedData = d3.stack()
            .keys(keys)
            (genreData)

        // console.log(genreData)
        // console.log(keys)
        // console.log(stackedData)

        //////////
        // AXIS //
        //////////

        // Add X axis
        var x = d3.scaleLinear()
            .domain(d3.extent(genreData, function (d) { return d.year; }))
            .range([0, width]);
        var xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(5))

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .text("Time (year)")

        // Add Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -20)
            .text("Global Sales of Video Games by Genre")
            .attr("text-anchor", "start")
            // .selectAll("text")

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 700])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y).ticks(5))



        //////////
        // BRUSHING AND CHART //
        //////////

        // Add a clipPath: everything out of this area won't be drawn.
        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        // Add brushing
        var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
            .extent([[0, 0], [width, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("brush", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

        // // Create the scatter variable: where both the circles and the brush take place
        var areaChart = svg.append('g')
            .attr("clip-path", "url(#clip)")

        // // Area generator
        var area = d3.area()
            .x(function (d) { return x(d.data.year); })
            .y0(function (d) { return y(d[0]); })
            .y1(function (d) { return y(d[1]); })

        // // Show the areas
        areaChart
            .selectAll("mylayers")
            .data(stackedData)
            .enter()
            .append("path")
            .attr("class", function (d) {
                // console.log("myArea " + d.key )
                return "myArea " + d.key
            })
            .style("fill", function (d) { return color(d.key); })
            .style("opacity", .75)
            .attr("d", area)

        // Add the brushing
        areaChart
            .append("g")
            .attr("class", "brush")
            .call(brush);

        var idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart({ selection }) {
            if (!selection) {
                return
            }
            // USED FOR VARIABLES IN LATERS GRAPHS (YEARS SELECTED)
            // console.log(x.invert(selection[0]), x.invert(selection[1]))
            startYear = Math.round(x.invert(selection[0]));
            endYear = Math.round(x.invert(selection[1]));
        }


        //////////
        // HIGHLIGHT GROUP //
        //////////

        var clickSelecting = false
        var genresSelected = []

        // What to do when one group is hovered
        var highlight = function (d) {
            if (!clickSelecting) {
                // console.log(d)
                // console.log("." + d.y.__data__)
                // console.log("." + d.target.__data__)
                // reduce opacity of all groups
                d3.selectAll(".myArea").transition().style("opacity", .2)
                d3.select("." + d.target.__data__).transition().style("opacity", 1)
            }
        }

        // And when it is not hovered anymore
        var noHighlight = function (d) {
            if (!clickSelecting) {
                d3.selectAll(".myArea").transition().duration(1250).style("opacity", .75)
            }
        }

        var genreChoice = function (d) {
            // reduce opacity of all groups
            let genreName = "." + d.target.__data__;
            if (genresSelected.includes(genreName)) {
                genresSelected = genreArrayRemove(genresSelected, genreName);
                clickSelecting = genresSelected.length != 0;
                // console.log("array", genresSelected);
                // console.log("selection", clickSelecting);
                if (!clickSelecting) {
                    d3.selectAll(".myArea").transition().duration(1250).style("opacity", .75);
                    return;
                }
                d3.select(genreName).transition().duration(1250).style("opacity", .1);
            }
            else {
                if (clickSelecting) {
                    genresSelected.push(genreName);
                    d3.select(genreName).transition().duration(10).style("opacity", 1);
                    return;
                }
                else {
                    clickSelecting = true
                    genresSelected.push(genreName)
                    d3.selectAll(".myArea").transition().duration(1250).style("opacity", .1)
                    d3.select("." + d.target.__data__).transition().duration(10).style("opacity", 1)
                }
            }
        }

        //////////
        // BUTTON //
        //////////

        // add button
        d3.select('#stacked_viz_button')
            .append("input")
            .attr("type", "button")
            .attr("class", "button")
            .attr("value", "Reset")
            .on('click', () => {
                clickSelecting = false
                genresSelected = []
                // reset all opacities
                d3.selectAll(".myArea").transition().duration(1250).style("opacity", .75)

                // // delete text
                // d3.selectAll('.selected')
                //     .text('None')
                //     .style('color', 'black')
            })

        // document.getElementById('one').appendChild(areaChart.node())

        // d3.select('#one')
        //     .append('h1')
        //     .attr('id', 'selected')
        //     .attr('class', 'selected')
        //     .style('font-family', 'sans-serif')
        //     .text('None')
        //     .style('color', 'black')

        //////////
        // LEGEND //
        //////////

        // // Add one dot in the legend for each name.
        var size = 20
        svg.selectAll("myrect")
            .data(keys)
            .enter()
            .append("rect")
            .attr("x", width)
            .attr("y", function (d, i) { return 10 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .style("fill", function (d) { return color(d) })
            .on("mouseover", highlight)
            .on("mouseout", noHighlight)
            .on("click", genreChoice)

        // // Add one dot in the legend for each name.
        svg.selectAll("mylabels")
            .data(keys)
            .enter()
            .append("text")
            .attr("x", width + size * 1.2)
            .attr("y", function (d, i) { return 10 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function (d) { return color(d) })
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseout", noHighlight)
            .on("click", genreChoice)



        //////////
        // PUBLISHER_BAR //
        //////////


        // TODO these will be passed to me from others
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
                .filter(d => !selectedPublisher || (selectedPublisher && selectedPublisher.index !== d.index))
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
        d3.select('#publisher_bar_viz')
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

        document.getElementById('publisher_bar_viz').appendChild(publisherChart.node())

        d3.select('#publisher_bar_viz')
            .append('h1')
            .attr('id', 'selected')
            .attr('class', 'selected')
            .style('font-family', 'sans-serif')
            .text('None')
            .style('color', 'black')
    })
})