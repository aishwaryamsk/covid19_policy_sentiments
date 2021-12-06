COVID-19 Sentiment Dashboard

1. DESCRIPTION

The objective of our project is to understand how COVID-19 related government policies affect people’s well-being. We created an interactive dashboard that allows users to visualize how different policy choices in the United States affect the overall sentiment of tweets, which were computed using state-of-the-art transformer based methods. We created a slider range selector that allows users to specify the starting and ending date that the users are interested in. We also showed daily covid cases/deaths that serves as important indicators of the pandemic situation.

2. INSTALLATION
To use our code, you can either visit https://yhch3n.site/ without any installation or host your own http server.
One of the simplest ways to host an http server is to type 'python3 -m http.server 8000' command in the folder containing 'map.html' and then visit https://0.0.0.0:8000/map.html with your browser.

3. EXECUTION
Visit https://yhch3n.site/ or visit https://0.0.0.0:8000/map.html if you hosted your own http server.
The user will immediately see a main dashboard that contains a map of the United States showing the average twitter sentiment for each state. By clicking on a state, the user will be able to see a graph that shows infection rates and sentiment over time with policy decisions labelled in based on the time they were enforced. By clicking on this visualization, the user will be able to see specific tweets with their labelled sentiments.
