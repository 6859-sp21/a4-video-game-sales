d3.csv("https://raw.githubusercontent.com/6859-sp21/a4-video-game-sales/main/vgsales_clean_2.csv")
    // .get(function (error, rows) { console.log(rows); })
    .then((data) => {

      // array of objects
      console.log(data.length);

      
    
      // create div
      const container = d3.create('div');
  
      const barChart = container.selectAll(/* TODO */)
    
      /* TODO: Add code here to generate the bar chart within the container. 
         (Hint: The "barData" variable holds the data to visualize.) */
      
      barChart
        .style('background', 'steelblue')   // Set the background color of the div to 'steelblue'
        .style('border', '1px solid white') // Set the border of the divs to 'white'
        .style('padding', '3px')            // Give the bars some padding
        .style('font-size', 'small')        // Set the font size of text inside the div to 'small'
      /* TODO: Add code here to finish styling the visual properties and content of <div> elements */
      
      return container.node();

    })
    .catch((error) => {
      console.error("Error loading the data");
    });
