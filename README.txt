COVID-19 Sentiment Dashboard

1. DESCRIPTION

The objective of our project is to understand how COVID-19 related government policies affect people’s well-being. We created an interactive dashboard that allows users to visualize how different policy choices in the United States affect the overall sentiment of tweets, which were computed using state-of-the-art transformer based methods. We created a slider range selector that allows users to specify the starting and ending date that the users are interested in. We also showed daily covid cases/deaths that serves as important indicators of the pandemic situation.

The following shows the external resources we use to create this project.
(1) Visualization
We use D3 library https://d3js.org/ by Mike Bostock for most of the visualization features.
We use https://github.com/johnwalley/d3-simple-slider by John Walley to create a slider range selector.
(2) Data
We get metadata of tweets from https://github.com/lopezbec/COVID19_Tweets_Dataset and https://github.com/lopezbec/COVID19_Tweets_Dataset_2020.
Then, we get the actual tweets using the Twitter API https://developer.twitter.com/en/docs/twitter-api.

2. INSTALLATION
A browser is the only thing that is needed to view our code. No additional installation are required. We already hosted an http server that shows our code at https://yhch3n.site/

3. EXECUTION
Visit https://yhch3n.site/ using your browser. The user will immediately see a main dashboard that contains a map of the United States showing the average twitter sentiment for each state. By clicking on a state, the user will be able to see a graph that shows infection rates and sentiment over time with policy decisions labelled in based on the time they were enforced. By clicking on this visualization, the user will be able to see specific tweets with their labelled sentiments.
