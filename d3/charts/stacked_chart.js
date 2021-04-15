const dataUrl = 'https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/vgsales_clean_2.csv'
const genreDataUrl = "https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/aggregated_genre.csv"

const width = 600
const height = 400

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
            dy = 0, 
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

// pack the data
const pack = data => d3.pack()
    .size([width - 2, height - 2])
    .padding(3)
    (d3.hierarchy({ children: data })
        .sum(d => d.value))

// Parse the Data
d3.csv(genreDataUrl).then((genreData) => {
    d3.csv(dataUrl, d3.autoType).then(data => {

        const margin = ({ top: 100, right: 300, bottom: 100, left: 500 })

        const defaultStartYear = 1980
        const defaultEndYear = 2020

        var keys = genreData.columns.slice(2);
        const genreColorScheme = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab", "#882020", "#a3d677"];

        var startYear = defaultStartYear
        var endYear = defaultEndYear
        // var genres = defaultGenres

        var clickSelecting = false
        var selectedGenres = []
        var readableGenres = selectedGenres.map(s => s.substring(1))


        let selectedPublisher = null

        // color palette
        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(genreColorScheme);

        //stack the data?
        var stackedData = d3.stack()
            .keys(keys)
            (genreData)


        //////////
        // PUBLISHER_BAR //
        ////////// 

        // filter the data
        var dataFilt = data.filter(d => {
            return startYear <= d.Year && d.Year <= endYear && (readableGenres.length === 0 || readableGenres.indexOf(d.Genre) > -1)
        })

        // aggregate
        let publisherSalesData = sumByCol(dataFilt, 'Publisher', 'Global_Sales')

        const marginBar = { left: 250, right: 0, top: 150, bottom: 0 }
        const svgBar = d3.create('svg')
            .attr('viewBox', [0, 0, width, height])

        var bar_xScale = d3.scaleLinear()
            .domain([0, d3.max(publisherSalesData, d => d[x])])
            .range([marginBar.left, width - marginBar.right])

        var bar_yScale = d3.scaleBand()
            .domain(d3.range(publisherSalesData.length))
            .rangeRound([marginBar.top, height - marginBar.bottom])
            .padding(0.1)

        var bar_xaxis = d3.axisTop(bar_xScale);

        var bar_yaxis = d3.axisLeft(bar_yScale)
            .tickFormat(i => publisherSalesData[i].name).tickSizeOuter(0)

        svgBar.append('g')
            .attr('transform', `translate(0, ${marginBar.top})`)
            .attr('class', 'x axis');

        svgBar.append('g')
            .attr('transform', `translate(${marginBar.left - 5}, 0)`)
            .attr('class', 'y axis');





        document.getElementById('publisher_bar_viz').appendChild(svgBar.node())

        // publisher chart
        const publisherOnMouseOver = d => {
            d3.selectAll('.bar')
                .transition()
            d3.selectAll('.bar')
                .filter(d => !selectedPublisher || (selectedPublisher && selectedPublisher.index !== d.index))
                .style('opacity', 0.3)
            d3.selectAll(`#bar-${d.index}`)
                .style('opacity', 1)
                .style('cursor', 'pointer')
        }
        const publisherOnMouseLeave = d => {
            d3.selectAll('.bar')
                .transition()
                .delay(100)
                .style('opacity', 1)
            if (selectedPublisher) {
                d3.selectAll('.bar')
                    .filter(d => selectedPublisher && selectedPublisher.index !== d.index)
                    .transition()
                    .delay(100)
                    .style('opacity', 0.3)
            }
        }
        const publisherOnClick = (d, colorScale) => {
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

        // const initialBarChart = () =>

        const dataJoinBarChart = () => {
            const x = 'value'
            const y = 'name'

            readableGenres = selectedGenres.map(s => s.substring(1))

            dataFilt = data.filter(d => {
                return startYear <= d.Year && d.Year <= endYear && (readableGenres.length === 0 || readableGenres.indexOf(d.Genre) > -1)
            })
            let publisherSalesData = sumByCol(dataFilt, 'Publisher', 'Global_Sales')
            // console.log(publisherSalesData, 'pubbbb')

            // filter test
            const margin = ({ top: 100, right: 300, bottom: 100, left: 500 })
            // const width = 1000
            // const height = 300

            console.log(publisherSalesData)

            bar_xScale.domain([0, d3.max(publisherSalesData, d => d[x])])
            // .range([margin.left, width - margin.right])

            bar_yScale.domain(d3.range(publisherSalesData.length))
            // .rangeRound([margin.top, height - margin.bottom])
            // .padding(0.1)

            const colorScale = d3.scaleOrdinal()
                .domain(publisherSalesData.map(d => d[y]))
                .range(d3.schemeTableau10)

            const format = bar_xScale.tickFormat(20, publisherSalesData.format)

            const tBar = svgBar.transition()
                .duration(750);

            svgBar.selectAll('rect')
                // .selectAll('rect')
                .data(publisherSalesData)
                .join(
                    enter => enter.append('rect')
                        .call(enter => enter.transition(tBar)
                            .attr('x', bar_xScale(0))
                            .attr('y', (d, i) => bar_yScale(i))
                            .attr('width', d => bar_xScale(d.value) - bar_xScale(0))
                            .attr('height', bar_yScale.bandwidth())
                            .attr('fill', d => colorScale(d.name))
                            .attr('class', `bar`)
                            .attr('id', d => `bar-${d.index}`))
                        .on('mouseover', (e, d) => {
                            publisherOnMouseOver(d)
                        })
                        .on('mouseleave', (e, d) => {
                            publisherOnMouseLeave(d)
                        })
                        .on('click', (event, d) => {
                            publisherOnClick(d, colorScale)
                        }),
                    update => update
                        .call(update => update.transition(tBar)
                            .attr('x', bar_xScale(0))
                            .attr('y', (d, i) => bar_yScale(i))
                            .attr('width', d => bar_xScale(d.value) - bar_xScale(0))
                            .attr('height', bar_yScale.bandwidth())
                            .attr('fill', d => colorScale(d.name))
                            .attr('class', `bar`)
                            .attr('id', d => `bar-${d.index}`))
                        .on('mouseover', (e, d) => {
                            publisherOnMouseOver(d)
                        })
                        .on('mouseleave', (e, d) => {
                            publisherOnMouseLeave(d)
                        })
                        .on('click', (event, d) => {
                            publisherOnClick(d, colorScale)
                        }),
                    exit => exit.remove()
                )

            svgBar.select('.x.axis')
                .transition()
                .duration(1000)
                .call(bar_xaxis);

            svgBar.select('.y.axis')
                .transition()
                .duration(1000)
                .call(bar_yaxis
                    .tickFormat(i => publisherSalesData[i].name).tickSizeOuter(0))

            console.log(svgBar.selectAll('.x-axis'), 'poopie')
        }

        dataJoinBarChart()

        // set up elements
        const svgBubble = d3.create('svg')
            .attr('viewBox', [0, 0, width, height])
            .attr('font-size', 12)
            .attr('font-family', 'sans-serif')
            .attr('text-anchor', 'middle')



        document.getElementById('bubble').appendChild(svgBubble.node())


        const dataJoinBubbleChart = () => {
            // filter test
            const dataFiltBubble = dataFilt.filter(d => !selectedPublisher || (d.Publisher == selectedPublisher.name))
            console.log(dataFilt.length, 'THE LENGTH')
            const gameSalesData = sumByCol(dataFiltBubble, 'Name', 'Global_Sales')

            // color by name
            const color = d3.scaleOrdinal(gameSalesData.map(d => d.name), d3.schemeSet3)

            // repack and run
            console.log(gameSalesData)
            const root = pack(gameSalesData)
            const leaves = root.leaves()

            console.log(leaves)

            const t = svgBubble.transition()
                .duration(750);

            const leaf = svgBubble.selectAll('g')
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
                            .attr('font-size', '8px')
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
        }

        dataJoinBubbleChart()

        // add button
        d3.select('#publisher_bar_viz')
            .append("input")
            .attr("type", "button")
            .attr("class", "button")
            .attr("value", "Reset")
            .on('click', () => {
                if (selectedPublisher) {
                    selectedPublisher = null
                    // reset all opacities
                    d3.selectAll('.bar')
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

        d3.select('#publisher_bar_viz')
            .append('h1')
            .attr('id', 'selected')
            .attr('class', 'selected')
            .style('font-family', 'sans-serif')
            .text('None')
            .style('color', 'black')

        //////////
        // GENERAL //
        //////////

        // append the svg object to the body of the page
        var svg = d3.select("#stacked_viz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        //////////
        // AXIS //
        //////////

        // Add X axis
        var x = d3.scaleLinear()
            .domain(d3.extent(genreData, function (d) { return d.year; }))
            .range([0, width]);
        var xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .style("font-family", "sans-serif")
            .style("font-size", '16px')
            .call(d3.axisBottom(x).ticks(5)
                .tickFormat(i => i))

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .attr("font-family", "sans-serif")
            .attr("font-size", 24)
            .text("Year")

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 700])
            .range([height, 0]);
        svg.append("g")
            .style("font-family", "sans-serif")
            .style("font-size", '16px')
            .call(d3.axisLeft(y).ticks(5))

        // Add Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -20)
            .attr("font-family", "sans-serif")
            .attr("font-size", 24)
            .text("Global Sales of Video Games by Genre")
            .attr("text-anchor", "start")

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
            .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

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
            startYear = Math.round(x.invert(selection[0]));
            endYear = Math.round(x.invert(selection[1]));

            // Update Bar Chart
            dataJoinBarChart()
            dataJoinBubbleChart()

            // TODO add year range as text element on area chart, upper left
        }


        //////////
        // HIGHLIGHT GROUP //
        //////////

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
            if (selectedGenres.includes(genreName)) {
                selectedGenres = genreArrayRemove(selectedGenres, genreName);
                clickSelecting = selectedGenres.length != 0;

                if (!clickSelecting) {
                    d3.selectAll(".myArea").transition().duration(1250).style("opacity", .75);

                    // Update Later Charts
                    dataJoinBarChart()
                    dataJoinBubbleChart()
                } else {
                    d3.select(genreName).transition().duration(1250).style("opacity", .1);

                    // Update Later Charts
                    dataJoinBarChart()
                    dataJoinBubbleChart()
                }

            }
            else {
                if (clickSelecting) {
                    selectedGenres.push(genreName);
                    d3.select(genreName).transition().duration(10).style("opacity", 1);

                    // Update Later Charts
                    dataJoinBarChart()
                    dataJoinBubbleChart()
                }
                else {
                    clickSelecting = true
                    selectedGenres.push(genreName)
                    d3.selectAll(".myArea").transition().duration(1250).style("opacity", .1)
                    d3.select("." + d.target.__data__).transition().duration(10).style("opacity", 1)

                    // Update Later Charts
                    dataJoinBarChart()
                    dataJoinBubbleChart()
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
                selectedGenres = []
                startYear = defaultStartYear
                endYear = defaultEndYear
                dataJoinBarChart()
                dataJoinBubbleChart()
                // reset all opacities
                d3.selectAll(".myArea").transition().duration(1250).style("opacity", .75)
            })

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
            .style('font-family', 'sans-serif')
            .on("mouseover", highlight)
            .on("mouseout", noHighlight)
            .on("click", genreChoice)
    })
})