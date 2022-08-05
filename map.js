let width = window.innerWidth - 225; //map width
let height = window.innerHeight - 30 - 150; // map height, subtract title and slider heights
let active = d3.select(null);


var margin = { top: 40, right: 70, bottom: 100, left: 50 }

// Timeline // for both map and line - 50% height each
let timeline_width = window.innerWidth - margin.right, timeline_height = window.innerHeight / 2;

let sentiments_xaxis, sentiments_yaxis, sentiments_xscale, sentiments_yscale;
let lines_a;
let geojson = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';
let usStatesDir = 'datasets/us.json';
let usAbbrevDir = 'datasets/us-state-names.tsv';
let usPolicyDir = 'datasets/states_policies_clean.tsv';

// map data 
// all time twitter sentiments
let sentimentsDir = 'datasets/sentiments.tsv';
let covidCasesDir = 'datasets/United_States_COVID-19_Cases_and_Deaths_all_States_over_Time.csv'

// Store read data
let usAbbreviations;
let usAbbreviationsDict;
let map_g;
let features;
let usPoliciesByState;
// Datasets
let twitterSentiments; // data[2]

// Color when no sentiments available
let defaultStateGrey = '#bdbdbd'

// First and Last Date of map
let firstDay = new Date(2020, 0, 1);
let lastDay = new Date(2021, 10, 1);



let avgSentimentsByState;
let avgSentimentsByStateYearMonth;
let covidCasesByState;
let covidDeathsByState;

// let colorScale;
let legend;

let currentState;

// color
let purple = '#af8dc3', green = '#5ab4ac', golden = '#d8b365';



// SVGs
let svg_map, svg_timeline, svg_covid_cases_timeline, svg_covid_deaths_timeline;

// Transition
let zoomStateTime = 750;

// A projection tells D3 how to orient the GeoJSON features
let projection = d3.geoAlbersUsa()
    .scale(900)
    .translate([width / 2, height / 2]);

let path = d3.geoPath().projection(projection);

Promise.all([
    d3.json(usStatesDir),
    d3.tsv(usAbbrevDir),
    d3.tsv(sentimentsDir),
    d3.csv(covidCasesDir),
    d3.tsv(usPolicyDir)
]).then(data => {
    let us = data[0];
    usAbbreviations = data[1];
    twitterSentiments = data[2];
    usAbbreviationsDictInit();
    processDataSets(firstDay, lastDay); // replace start and end with true start and end timestamps originally
    //processDataSetsTimeline(data[2]);

    //processDataSetsCovid(data[3]);
    //processPolicies(data[4]);

    // Map
    svg_map = d3.select("#map")
        .attr("width", width)
        .attr("height", height);
    drawMap(svg_map, us);

    // Add legend
    addLegend();

    // Timelines
    svg_timeline = d3.select("body").append("svg")
        .attr('id', 'timeline')
        .attr("width", timeline_width)
        .attr("height", timeline_height);
    svg_covid_cases_timeline = d3.select("body").append("svg")
        .attr('id', 'timeline_covid')
        .attr("width", timeline_width)
        .attr("height", timeline_height);
    svg_covid_deaths_timeline = d3.select("body").append("svg")
        .attr('id', 'timeline_covid_deaths')
        .attr("width", timeline_width)
        .attr("height", timeline_height);

    d3.select('#timeline').style("opacity", 0).style("display", "none");
    d3.select('#timeline_covid').style("opacity", 0).style("display", "none");
    d3.select('#timeline_covid_deaths').style("opacity", 0).style("display", "none");

});


function drawMap(svg, us) {
    features = topojson.feature(us, us.objects.states).features;

    /* Initialize tooltip */
    /* var tip = d3.tip()
        .attr("id", "tooltip")
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(function (d) {
            //return '<span>' + '<b>' + getCountryObject(d.id).name + '</b>' + '</span>';
            return '<span>' + '<b>' + avgSentimentsByState[getCountryObj(d.id).code] + '</b>' + '</span>';
        })
        .direction('ne'); */



    map_g = svg.append("g")
        .style("stroke-width", "1.5px");

    map_g
        .attr("class", "state")
        .selectAll("path")
        .data(features)
        .enter()
        .append("path")
        .attr('d', path)
        .attr('id', function (d) {
            // Associated sentiment for this state
            let code = getStateObj(d.id).code;
            // Remove DC - District of Columbia is not a state
            if (code != 'DC')
                return 'path_' + d.id;
        })
        .attr("fill", function (d) {
            // Associated sentiment for this state
            let code = getStateObj(d.id).code;
            // Remove DC - District of Columbia is not a state
            if (code != 'DC')
                return colorScale(avgSentimentsByState[code]);
        })

    //.on('click', handleStateClick);

    map_g.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("class", "mesh")
        .attr("d", path);

    // Add State labels

    //addStateLabels(map_g, features);
    svg.append("g")
        .selectAll("state-names")
        .data(features)
        .enter()
        .append("text")
        .attr('class', 'state-names')
        .text(function (d) {
            let code = getStateObj(d.id).code;
            // Remove DC - District of Columbia is not a state
            if (code != 'DC')
                return code;
        })
        .attr("x", function (d) {
            let c = path.centroid(d)
            if (c[0])
                return c[0];
        })
        .attr("y", function (d) {
            let c = path.centroid(d)
            if (c[1])
                return c[1];
        })
        .attr("text-anchor", "middle")
        .attr('fill', '#484848')
        .attr("font-size", "10px");

    // Add state text
    svg_map.append("text")
        .attr('id', 'selected-state')
        .text('')
        .attr("text-anchor", "middle")
        .attr("x", width * 0.5)
        .attr("y", height / 2)
        .attr("dy", "-10");
}


function addStateLabels(svg, features) {
    svg.append("g")
        .selectAll("stateText")
        .data(features)
        .enter()
        .append("text")
        .attr('class', 'stateText')
        .text(function (d) {
            let code = getStateObj(d.id).code;
            // Remove DC - District of Columbia is not a state
            if (code != 'DC')
                return code;
        })
        .attr("x", function (d) {
            let c = path.centroid(d)
            if (c[0])
                return c[0];
        })
        .attr("y", function (d) {
            let c = path.centroid(d)
            if (c[1])
                return c[1];
        })
        .attr("text-anchor", "middle")
        .attr('fill', '#484848')
        .attr("font-size", "10px");
}


function getStateObj(id) {
    let state = null;
    usAbbreviations.forEach(stateObj => {
        if (+stateObj.id === +id)
            state = stateObj;
    });
    return state;
}


// Zoom to state
function handleStateClick(d, i) {


    // If clicked on an active state, reset it
    if (active.node() === this) return reset();

    // Find bounds of selected state
    let bounds = path.bounds(d);
    dx = bounds[1][0] - bounds[0][0];
    dy = bounds[1][1] - bounds[0][1];
    x = (bounds[0][0] + bounds[1][0]) / 2;
    y = (bounds[0][1] + bounds[1][1]) / 2;

    // Adjust scale of zoom
    let zoomScale = 0.3;
    scale = zoomScale / Math.max(dx / width, dy / height);

    // Adjust vertical position on page
    let y_state = height / 4;
    translate = [width / 2 - scale * x, y_state - scale * y];

    d3.selectAll('.state-names').style("display", "none");

    // Fade all states
    d3.selectAll(".state > path")
        .transition()
        .duration(zoomStateTime)
        .style("opacity", 0);

    // Keep selected state as opaque all states to white
    let activeState = d3.select(this);
    activeState.transition()
        .duration(zoomStateTime).style("opacity", 1);


    // Transition to make the border lines thinner on zoom
    // Transition to zoom into state
    map_g.transition()
        .duration(zoomStateTime)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ") scale(" + scale + ")")
        .on('end', function () {
            // Hide other states after transition completes
            d3.selectAll(".state > path").style("display", "none");
            activeState.style("display", "inline");

            // Show selected state title
            d3.select('#selected-state').text(getStateObj(d.id).name);
            d3.select('#selected-state').style("display", "inline");

            // Show Back button
            d3.select('#back').style("display", "inline");
        });

    // Reduce height to make space for timeline chart
    svg_map.transition()
        .duration(zoomStateTime)
        .attr('height', timeline_height);

    //Remove timeline children. 
    const myNode = document.getElementById("timeline");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }
    //Remove timeline children. 
    const myNode2 = document.getElementById("timeline_covid");
    while (myNode2.firstChild) {
        myNode2.removeChild(myNode2.lastChild);
    }
    const myNode3 = document.getElementById("timeline_covid_deaths");
    while (myNode3.firstChild) {
        myNode3.removeChild(myNode3.lastChild);
    }

    /* SHOW TIMELINE */
    drawTimeLine(svg_timeline, getStateObj(features[i].id).code);
    drawTimeLineCovid(svg_covid_cases_timeline, getStateObj(features[i].id).code);
    drawTimeLineCovidDeaths(svg_covid_deaths_timeline, getStateObj(features[i].id).code);


    // Make timeline opaque
    d3.select('#timeline')
        .style("display", "inline")
        .transition()
        .duration(zoomStateTime).style("opacity", 1);
    d3.select('#timeline_covid')
        .style("display", "inline")
        .transition()
        .duration(zoomStateTime).style("opacity", 1);
    d3.select('#timeline_covid_deaths')
        .style("display", "inline")
        .transition()
        .duration(zoomStateTime).style("opacity", 1);

    // Activate class
    active.classed("active", false);
    active = d3.select(this).classed("active", true);
}

// Zoome out of selected state
function reset() {

    // Hide selected state title
    d3.select('#selected-state').text('');
    d3.select('#selected-state').style("display", "none");

    // Hide Back button
    d3.select('#back').style("display", "none");

    // Show other states
    // Transition to make other states opaque
    d3.selectAll(".state > path")
        .style("display", "inline")
        .transition()
        .duration(zoomStateTime)
        .style("opacity", 1)

    // Transition to make the border lines thicker (or, back to normal)
    // and remove transformations
    map_g.transition()
        .duration(zoomStateTime)
        .style("stroke-width", "1.5px")
        .attr("transform", "")
        .on('end', function () {
            // Show state abbreviations
            d3.selectAll('.state-names').style("display", "inline");
        });

    // Increase height of map to show the US map
    svg_map.transition()
        .duration(zoomStateTime)
        .attr('height', height);

    // Fade timeline
    d3.select('#timeline')
        .transition()
        .duration(zoomStateTime).style("opacity", 0)
        .on('end', function () {
            d3.select('#timeline').style("display", "none");
        })
    d3.select('#timeline_covid_deaths')
        .transition()
        .duration(zoomStateTime).style("opacity", 0)
        .on('end', function () {
            d3.select('#timeline_covid_deaths').style("display", "none");
        })
    d3.select('#timeline_covid')
        .transition()
        .duration(zoomStateTime).style("opacity", 0)
        .on('end', function () {
            d3.select('#timeline_covid').style("display", "none");
        })
    // Mark the state as not active anymore
    active.classed("active", false);
    active = d3.select(null);
}

// Update cholorpleth map with new start and end timestamps
function updateCholorplethMap(startDateTime, endDateTime) {
    // Update dataset - avgSentimentsByState
    processDataSets(startDateTime, endDateTime);

    /* update color for each state:
    Go over each state text to get state names (this is one approach)
    Retrieve state path by ID --> d3.select('#path_'+state_id)
    Update color for state path
    */
    d3.selectAll('.state-names').nodes().forEach((d) => { // d --> state text
        let state_id = d3.select(d).data()[0].id;
        let state = getStateObj(d3.select(d).data()[0].id).code;
        let color = colorScale(avgSentimentsByState[state]);
        // update color for state
        if (state != 'DC' && color) {
            d3.select('#path_' + state_id).style('fill', color);
        } else if (!color) {
            d3.select('#path_' + state_id).style('fill', defaultStateGrey);
        }
    });
}

// filter dataset by time
function processDataSets(start, end) {
    // Compute cumulative sentiments by state
    let cumulativeSentimentsByState = {};
    for (let i = 0; i < twitterSentiments.length; i++) {
        // Get timestamps in miliseconds - (13 digits in timestamp)
        if (new Date(twitterSentiments[i].timestamp * 1000) >= start
            && new Date(twitterSentiments[i].timestamp * 1000) <= end) {
            if (!cumulativeSentimentsByState[twitterSentiments[i].state]) {
                cumulativeSentimentsByState[twitterSentiments[i].state] =
                    { 'sentiment': [+twitterSentiments[i].sentiment] }
            } else cumulativeSentimentsByState[twitterSentiments[i].state]['sentiment']
                .push(+twitterSentiments[i].sentiment)
        }
    }

    // Compute average sentiments by state
    const avg = l => l.reduce((prev, cur) => prev + cur) / l.length;
    avgSentimentsByState = {}
    for (let state in cumulativeSentimentsByState) {
        avgSentimentsByState[state] = avg(cumulativeSentimentsByState[state]['sentiment']);
    }
}

function usAbbreviationsDictInit() {
    usAbbreviationsDict = {};
    usAbbreviations.forEach(countryObj => {
        usAbbreviationsDict[countryObj.code] = countryObj.name
    });
}