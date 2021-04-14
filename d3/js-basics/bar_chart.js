
// set the dimensions and margins of the graph
var margin = { top: 40, right: 30, bottom: 30, left: 50 },
    width = 2500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/vgsales_clean_2.csv",
    function (d) {
        return {
            Rank: +d.Rank,
            Name: d.Name,
            Platform: d.Platform,
            Year: +d.Year,
            Genre: d.Genre,
            Publisher: d.Publisher,
            NA_Sales: +d.NA_Sales,
            EU_Sales: +d.EU_Sales,
            JP_Sales: +d.JP_Sales,
            Other_Sales: +d.Other_Sales,
            Global_Sales: +d.Global_Sales
        };
    })
    .then((data) => {

        // array of objects
        console.log(data.length);
        // console.log(data)
        // console.log(data[0]);

        listData = data.filter(d => d.Year === 2005)
            .sort((a, b) => b.Global_Sales - a.Global_Sales)
            .slice(0, 10);

        // console.log(listData);

        mapData = {};
        for (let e in listData) {
            mapData[listData[e].Name] = listData[e].Global_Sales;
        }
        // console.log(mapData);

        let names = [];
        let globals = [];

        for (let e in listData) {
            names.push(listData[e].Name);
            globals.push(listData[e].Global_Sales);
        }
        // console.log(names);
        // console.log(globals);

        // Add X axis
        var x = d3.scaleBand().range([0, width]).padding(0.1);

        // Add Y axis
        var y = d3.scaleLinear().range([height, 0]);

        x.domain(names);
        y.domain([0, d3.max(globals, function (d) { return d; })]);

        // Add to SVG
        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(5));

        // Make the Bar Plot
        let bars = svg.selectAll('.bar')
            .data(names)
            .enter()
            .append("g");

        bars.append('rect')
            .attr('class', 'bar')
            .attr("x", function (d) { return x(d); })
            .attr("y", function (d) { return y(mapData[d]); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(mapData[d]); });

        bars.append("text")
            .text(function (d) {
                return mapData[d];
            })
            .attr("x", function (d) {
                return x(d) + x.bandwidth() / 2;
            })
            .attr("y", function (d) {
                return y(mapData[d]) - 5;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .attr("text-anchor", "middle");
    })
    .catch((error) => {
        console.error("Error loading the data");
    });