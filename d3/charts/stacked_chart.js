
// set the dimensions and margins of the graph
var margin = { top: 60, right: 230, bottom: 50, left: 100 },
    width = 660 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#stacked_viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
// https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/aggregated_genre.csv
// d3.csv("https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/vgsales_clean_2.csv",
d3.csv("https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/aggregated_genre.csv",
    // function (d) {
    //     // return {
    //     //     Rank: d.Rank,
    //     //     Name: d.Name,
    //     //     Platform: d.Platform,
    //     //     Year: d.Year,
    //     //     Genre: d.Genre,
    //     //     Publisher: d.Publisher,
    //     //     NA_Sales: d.NA_Sales,
    //     //     EU_Sales: d.EU_Sales,
    //     //     JP_Sales: d.JP_Sales,
    //     //     Other_Sales: d.Other_Sales,
    //     //     Global_Sales: d.Global_Sales
    //     // };
    //     return {
    //         Rank: +d.Rank,
    //         Name: d.Name,
    //         Platform: d.Platform,
    //         Year: +d.Year,
    //         Genre: d.Genre,
    //         Publisher: d.Publisher,
    //         NA_Sales: +d.NA_Sales,
    //         EU_Sales: +d.EU_Sales,
    //         JP_Sales: +d.JP_Sales,
    //         Other_Sales: +d.Other_Sales,
    //         Global_Sales: +d.Global_Sales
    //     };
    // })
    ).then((data) => {

    var keys = data.columns.slice(2);
    console.log(keys)

        //////////
        // GENERAL //
        //////////

        var genreColorScheme = [
            "#66c2a5",
            "#fc8d62",
            "#8da0cb",
            "#e78ac3",
            "#a6d854",
            "#ffd92f",
            "#e5c494",
            "#b3b3b3",
            "#9058d2",
            "#dc5a44",
            "#78d3d8",
            "#48932e"];

        console.log(data.length);
        // console.log(d3.schemeSet2);
        // console.log(data);
        // console.log(data[0]);

        // var genreNames = new Set();
        // data.forEach(d => {
        //     genreNames.add(d.Genre);
        // });

        // List of Genres
        // var keys = data.columns.slice(1);
        // var keys = Array.from(genreNames).sort();
        // console.log(keys);

        // var uYears = [1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];

        // for (let y in uYears) {
        //     genre_sales_for_year = {};
        //     var cur_year = uYears[y];
        //     // console.log(uYears[y]);listData = data.filter(d => d.Year === 2005)
        //     var data_for_year = data.filter(d => d.Year === )
        //     for (let g in genres) {
                
        //     }
        // }

        // var nested = d3.nest().key(function(d) {
        //     return d.Genre;
        // }).rollup(function(leaves) {
        //     return d3.sum(leaves, function(d) {
        //         return d.Global_Sales;
        //     });
        // }).entries(data.filter(d => d.Year === 2005));

        // var filt = data.filter(d => d.Year === 2005);
        // var grouped = d3.group(data, d => d.Year, d => d.Genre);
        // var grouped = Array.from(d3.rollup(data, v => d3.sum(v, function(g){return g.Global_Sales}), d => d.Year, d => d.Genre), ([key, value]) => ({key, value}));

        // const flat = grouped.map(d => {
        //     const res = {}
        //     res['year'] = d.key
        //     // console.log(d.value);
        //     keys.forEach(genre => {
        //         // console.log('gen', genre);
        //         // console.log('d.value entry', d.value.get(genre));
        //         // console.log('is it there', genre in d.value);
        //         if (d.value.get(genre)){
        //             // console.log("Hello");
        //             res[genre] = d.value.get(genre);
        //         }
        //         else {
        //             // console.log("Goodbye");
        //             res[genre] = 0;
        //         }
        //     })
            
        //     // d.value.forEach((val, genre) => {
        //     //     res[genre] = val
        //     //     // res[genre] = d.value[genre]
        //     // })
        //     // genreNames.forEach(genre => {
        //     //     if (! (genre in res)){
        //     //         res[genre] = 0
        //     //     }
        //     // })
        //     // console.log(res);
        //     // console.log(Array.from(res));
        //     // console.log(res.sort((a,b) => b-a));
        //     return res
        // })
        
        // const flat = grouped.map(d => ({
        //     year: d.key,
        //     ... d.value
        //     // Sports: , "Platform", "Racing", "Role-Playing", "Puzzle", "Misc", "Shooter", "Simulation", "Action", "Fighting", "Adventure", "Strategy"

        // }))
        // console.log(grouped);

        // console.log('keys', keys);
        // console.log('flat', flat);


        // color palette
        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(genreColorScheme);

        //stack the data?
        var stackedData = d3.stack()
        .keys(keys)
        (data)
        // var stackedData = d3.stack()
        //     .keys(keys)
        //     (flat)

        console.log(data)
        console.log(keys)
        console.log(stackedData)
        



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
            // .attr("clip-path", "url(#clip)")

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
                console.log("myArea " + d.key )
                return "myArea " + d.key })
            .style("fill", function (d) { return color(d.key); })
            .attr("d", area)

        // Add the brushing
        areaChart
            .append("g")
            .attr("class", "brush")
            .call(brush);

        var idleTimeout
        function idled() { idleTimeout = null; }


        // function brushed({selection}) {
        //     let value = [];
        //     if (selection) {
        //       const [[x0, y0], [x1, y1]] = selection;
        //       value = dot
        //         .style("stroke", "gray")
        //         .filter(d => x0 <= x(d.x) && x(d.x) < x1 && y0 <= y(d.y) && y(d.y) < y1)
        //         .style("stroke", "steelblue")
        //         .data();
        //     } else {
        //       dot.style("stroke", "steelblue");
        //     }
        //     svg.property("value", value).dispatch("input");
        //   }

        // A function that update the chart for given boundaries
        function updateChart({selection}) {
            // if (!d3.sourceEvent) return;
            if (!selection){
                return
            } ; // Only transition after input.
          
            console.log(x.invert(selection[0]), x.invert(selection[1]))
          
        }



        //////////
        // HIGHLIGHT GROUP //
        //////////

        // What to do when one group is hovered
        var highlight = function (d) {
            console.log(d)
            // console.log("." + d.y.__data__)
            console.log("." + d.target.__data__)
            // reduce opacity of all groups
            d3.selectAll(".myArea").style("opacity", .1)
            // expect the one that is hovered
            // d3.select("." + d).style("opacity", 1)
            // d3.select(".myArea " + d).style("opacity", 1)
            d3.select("." + d.target.__data__).style("opacity", 1)
        }

        // And when it is not hovered anymore
        var noHighlight = function (d) {
            d3.selectAll(".myArea").style("opacity", 1)
        }



        //////////
        // LEGEND //
        //////////

        // // Add one dot in the legend for each name.
        var size = 20
        svg.selectAll("myrect")
            .data(keys)
            .enter()
            .append("rect")
            .attr("x", 400)
            .attr("y", function (d, i) { return 10 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .style("fill", function (d) { return color(d) })
            .on("mouseover", highlight)
            .on("mouseout", noHighlight)

        // // Add one dot in the legend for each name.
        svg.selectAll("mylabels")
            .data(keys)
            .enter()
            .append("text")
            .attr("x", 400 + size * 1.2)
            .attr("y", function (d, i) { return 10 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function (d) { return color(d) })
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseout", noHighlight)

    })