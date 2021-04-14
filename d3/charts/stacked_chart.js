
function genreArrayRemove(arr, value) {
    return arr.filter(function(ele) {
        return ele != value;
    });
}

// Parse the Data
d3.csv("https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/aggregated_genre.csv").then((data) => {

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

    var keys = data.columns.slice(2);
    console.log(keys)

    //////////
    // GENERAL //
    //////////

    var genreColorScheme = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab", "#882020", "#a3d677"];

    console.log(data.length);

    // color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(genreColorScheme);

    //stack the data?
    var stackedData = d3.stack()
        .keys(keys)
        (data)

    // console.log(data)
    // console.log(keys)
    // console.log(stackedData)

    //////////
    // AXIS //
    //////////

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d.year; }))
        .range([0, width]);
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5))

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .text("Time (year)");

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20)
        .text("Global Sales of Video Games by Genre")
        .attr("text-anchor", "start")

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
        else{
            if (clickSelecting) {
                genresSelected.push(genreName);
                d3.select(genreName).transition().duration(10).style("opacity", 1);
                return;
            }
            else {
                clickSelecting = true
                genresSelected.push(genreName)
                // console.log(genresSelected)
                // Write functions to handle logic checking selected genre against other genres for fading
                d3.selectAll(".myArea").transition().duration(1250).style("opacity", .1)
                d3.select("." + d.target.__data__).transition().duration(10).style("opacity", 1)
            }
        }
    }

    //////////
    // BUTTON //
    //////////

    // add button
    d3.select('#stacked_viz')
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
})