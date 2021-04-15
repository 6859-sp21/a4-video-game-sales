a4-video-game-sales

- Christian Moroney (cmoroney)
- Jackson Bernatchez (jrbernat)
- Kevin Lyons (kalyons)

<<< Dataset >>>
----------------------------------------------------------
https://www.kaggle.com/arslanali4343/sales-of-video-games

<<< Design Decisions >>>
----------------------------------------------------------
Since our project is dealing with a large dataset, with many columns (genre, publisher, global sales, North America sales, platform, etc.), the most important decision we had to make was how we wanted the user to navigate the data, and what features were most important. To make these decisions, we did some initial exploration with Tableau. After experimenting with many different plots, we thought that the most compelling and informative choice for our main plot was a stacked area chart showing global sales over time, separated by genre. This gives the user the baseline knowledge about the dataset that they need to understand it, and the separation by genre is intended to induce curiosity in the user, so they can start exploring by choosing a genre, or multiple genres, to filter on. Initially, we had a second graph that showed the filtered genre sales over time, where the user could then select a time range. After receiving feedback on our MVP, we decided to combine the two features within the first chart. 

Our next design decision was deciding what happens after the user filters based on time and/or genre. Again, after experimentation within Tableau, we decided to display a bar chart that shows sales by publisher within the selected genre/time range. Users can then select a given publisher, and a bubble chart is displaced beneath, which shows the top games, given the publisher and other filters, with size corresponding to total global sales. Unlike in the stacked area chart, we decided to only allow a single publisher to be selected in the bar chart. Our rationale behind this is that the chart already allows direct comparison between publishers, and allowing multiple selections here would make the visualization too noisy/confusing. 

For our MVP, we had a second bar chart, rather than a bubble chart, for the breakdown of games. Additionally, we allowed users to pick a game, and see the breakdown across platforms in another bar chart. After reviewing feedback, we decided that the final chart was not necessary, and that having more charts didn’t necessarily make our visualization better. Additionally. We decided to use the bubble chart instead, as it is more intriguing and less repetitive than another bar chart. In place of the final bar chart, we added a tool tip that allows users to see the exact number of sales for each game. We believe that our updated design captures much of the explorative potential from our MVP, but is easier to use, and less noisy. 

<<< Development Process >>>
----------------------------------------------------------
For our MVP, we implemented our visualization in Altair, which is a Python wrapper for Vega-Lite. After feedback from our peers, we made the decision to re-implement everything in D3. This was a tough decision, but due to the lag present in our Altair charts, and limited customization, it was the right thing to do. We spent a lot of time reproducing our initial charts, and the most difficult and time consuming part was handling all of the joining and linking of the charts. We were fortunate that the three of us live together, as we were able to partner or group code for much of this process. Initially, Kevin worked on reproducing the bar charts, and Christian and Jack worked on reproducing the stacked area chart. We were fortunate to find many examples online that we were able to learn from, as none of us are very familiar with D3. 

Once we got the charts made, we had to tackle the linking. Much of this process was done with the three of us huddle around one computer, and a lot of trial and error, but eventually, we were able to link the three charts in a functionally correct way. From here, there was a lot of testing, finding and fixing bugs, and minor improvements, such as robustness to edge cases, reset buttons, the tooltip, and more. 

Finally, Kevin, our web-dev expert, tackled “sprucing” our visualization up. This included everything from improving labels and titles to optimizing layout. We were all pretty amazed at how much better the visualization looked after Kevin worked his magic. 

In all, between the three of us, we probably spent around 4 hours on initial exploration, 15 hours on the MVP, and 30 hours on the final product, for a total of around 40-50 hours. That being said, we did not log our work so these numbers are just estimates. 

