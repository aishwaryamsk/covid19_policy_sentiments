let width = window.innerWidth, height = window.innerHeight, active = d3.select(null);

// Timeline // for both map and line - 50% height each
let timeline_width = window.innerWidth, timeline_height = window.innerHeight / 2;

var margin = { top: 15, right: 70, bottom: 60, left: 50 }

let geojson = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';
let usStatesDir = '/us.json';
let usAbbrevDir = '/us-state-names.tsv';
let usPolicyDir = '/states_policies_clean.tsv';

// map data 
// all time twitter sentiments
let twitterSentimentsDir = '/twitter_sentiments_by_state.csv';

// Store read data
let usAbbreviations;
let usAbbreviationsDict;
let map_g;
let features;
let usPoliciesByState;


let avgSentimentsByState;
let avgSentimentsByStateYearMonth;
let colorScale;
let legend;

// SVGs
let svg_map, svg_timeline;

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
    d3.csv(twitterSentimentsDir),
    d3.tsv(usPolicyDir)
]).then(data => {
    let us = data[0];
    usAbbreviations = data[1];
    usAbbreviationsDictInit();
    processDataSets(data[2]);
    processDataSetsTimeline(data[2]);
    processPolicies(data[3]);


    // LEGEND
    /* Define color scale */
    colorScale = getColorScale();
    legend = getSentimentsLegend(colorScale);

    // Map
    svg_map = d3.select("body").append("svg")
        .attr('id', 'map')
        .attr("width", width)
        .attr("height", height);
    drawMap(svg_map, us);


    // Timeline
    svg_timeline = d3.select("body").append("svg")
        .attr('id', 'timeline')
        .attr("width", width)
        .attr("height", timeline_height);

    // Hide timeline until user clicks on state
    /* d3.select('#timeline').style({
        "opacity": 0,
        "display": "none"
    }); */

    d3.select('#timeline').style("opacity", 0).style("display", "none");

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
        .attr("id", "states")
        .attr("class", "state")
        .selectAll("path")
        .data(features)
        .enter().append("path")
        .attr('d', path)
        //.attr('fill', '#ccc')
        .attr("fill", function (d) {
            // Associated sentiment for this state
            let code = getCountryObj(d.id).code;
            return colorScale(avgSentimentsByState[code]);
        })
        /* .on('mouseover', tip.show)
        .on('mouseout', tip.hide) */
        //.on('mouseover', handleStateMouseOver)

        .on('click', handleStateClick);

    map_g.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("class", "mesh")
        .attr("d", path);

    //map_g.call(tip);

    // Add State labels
    let stateLabels = svg.append("g")
        .selectAll("text")
        .data(features)
        .enter()
        .append("text")
        .attr('class', 'state-names')
        .attr("text-anchor", "middle")
        .text(function (d) {
            return getCountryObj(d.id).code;
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

    // Create the force layout with a slightly weak charge
    /* var force = d3.layout.force()
        .nodes(labels)
        .charge(-20)
        .gravity(0)
        .chargeDistance(width / 8)
        .size([width, height]); */

    /* let force = d3.forceSimulation()
        .nodes(usAbbreviations)
        //.force("link", d3.forceLink(links).distance(100))
        //.force('center', d3.forceCenter(width / 2, height / 2))
        //.force("x", d3.forceX())
        //.force("y", d3.forceY())
        .force("charge", d3.forceManyBody().strength(-20))
        .alphaTarget(1) */
    //.on("tick", tick);

    /* force.on("tick", function (e) {
            var k = .1 * e.alpha;
            stateLebels.forEach(function (o, j) {
                // The change in the position is proportional to the distance
                // between the label and the corresponding place (foci)
                o.y += (foci[j].y - o.y) * k;
                o.x += (foci[j].x - o.x) * k;
            });
    
            // Update the position of the text element
            svg.selectAll("text.state-names")
                .attr("x", function (d) { return d.x; })
                .attr("y", function (d) { return d.y; });
        }); */

    svg.append("g")
        .attr("class", "legend")
        //.attr("transform", "translate(" + 0.73 * (width) + "," + 0.6 * (height) + ")")
        .attr("transform", "translate(" + 0.8 * (width) + "," + 0.2 * (height) + ")")
        .call(legend);


}

function getCountryObj(id) {
    let country = null;
    usAbbreviations.forEach(countryObj => {
        if (+countryObj.id === +id)
            country = countryObj;
    });
    return country;
}

/* function handleStateMouseOver(d, i) {
    let centroid = path.centroid(d)
    /* d3.select(this)
    .attr("transform", "translate(" + [-15,-15] + ") scale(" + 1.1 + ")")
} */


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
    let zoomScale = 0.4;
    scale = zoomScale / Math.max(dx / width, dy / height);

    // Adjust vertical position on page
    let y_state = height / 4;
    translate = [width / 2 - scale * x, y_state - scale * y];

    d3.selectAll('.state-names').style("display", "none");

    // Fade legend
    d3.select('.legend')
        .transition()
        .duration(zoomStateTime/2)
        .style("opacity", 0);

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
        });

    // Reduce height to make space for timeline chart
    svg_map.transition()
        .duration(zoomStateTime)
        .attr('height', timeline_height);

    /* SHOW TIMELINE */
    drawTimeLine(svg_timeline, getCountryObj(features[i].id).code);
    // Make timeline opaque
    d3.select('#timeline')
        .style("display", "inline")
        .transition()
        .duration(zoomStateTime).style("opacity", 1);

    // Activate class
    active.classed("active", false);
    active = d3.select(this).classed("active", true);
}


// Zoome out of selected state
function reset() {
    // Show other states
    // Transition to make other states opaque
    d3.selectAll(".state > path")
        .style("display", "inline")
        .transition()
        .duration(zoomStateTime)
        .style("opacity", 1)

    // Show legend
    d3.select('.legend')
        .transition()
        .duration(zoomStateTime)
        .style("opacity", 1);

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

    // Mark the state as not active anymore
    active.classed("active", false);
    active = d3.select(null);
}

function getColorScale() {
    return d3.scaleQuantile()
        .domain([-1, 1])
        .range(['#ef8a62', '#deebf7', '#67a9cf']);
}

function getSentimentsLegend(colorScale) {
    return d3.legendColor()
        //.labelFormat(d3.format(".2f"))
        .labels(['Negative', 'Neutral', 'Positive'])
        .ascending(true)
        .title('Average Sentiment')
        .scale(colorScale);
}

function processDataSets(twitterSentiments) {
    // Compute cumulative sentiments by state
    let cumulativeSentimentsByState = {};
    for (let i = 0; i < twitterSentiments.length; i++) {
        if (!cumulativeSentimentsByState[twitterSentiments[i].state]) {
            cumulativeSentimentsByState[twitterSentiments[i].state] =
                { 'sentiment': [+twitterSentiments[i].sentiment] }
        } else cumulativeSentimentsByState[twitterSentiments[i].state]['sentiment']
            .push(+twitterSentiments[i].sentiment)
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


function processDataSetsTimeline(twitterSentiments) {
    // Compute cumulative sentiments by state and Year, Month
    let cumulativeSentimentsByStateYearMonth = {};
    for (let i = 0; i < twitterSentiments.length; i++) {
        // for (let i = 0; i < 10; i++) {
        let tmpDate = new Date(parseInt(twitterSentiments[i].timestamp + '000'));
        let year = tmpDate.getFullYear();
        let month = tmpDate.getMonth() + 1;
        let yearMonth = year.toString() + "," + month.toString();

        if (!cumulativeSentimentsByStateYearMonth[twitterSentiments[i].state]) {
            cumulativeSentimentsByStateYearMonth[twitterSentiments[i].state] = {};
        }
        if (!cumulativeSentimentsByStateYearMonth[twitterSentiments[i].state][yearMonth]) {
            cumulativeSentimentsByStateYearMonth[twitterSentiments[i].state][yearMonth] =
                { 'sentiment': [+twitterSentiments[i].sentiment] };
        } else {
            cumulativeSentimentsByStateYearMonth[twitterSentiments[i].state][yearMonth]['sentiment']
                .push(+twitterSentiments[i].sentiment)
        }
    }
    // Compute average sentiments by state and Year, Month
    const avg = l => l.reduce((prev, cur) => prev + cur) / l.length;
    avgSentimentsByStateYearMonth = {};
    for (let state in cumulativeSentimentsByStateYearMonth) {
        avgSentimentsByStateYearMonth[state] = {}
        for (let yearMonth in cumulativeSentimentsByStateYearMonth[state]) {
            avgSentimentsByStateYearMonth[state][yearMonth] = avg(cumulativeSentimentsByStateYearMonth[state][yearMonth]['sentiment']);
        }
    }
}

function drawTimeLine(svg, state) {
    let sentimentsYM = avgSentimentsByStateYearMonth[state];

    const monthParser = d3.timeParse("%Y,%m");
    let lineData = [];

    for (let yearMonth in sentimentsYM) {
        let dt = monthParser(yearMonth);
        lineData.push({ date: dt, sentiment: sentimentsYM[yearMonth] });
    }

    let timeline_g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let xScale = d3.scaleTime()
        .range([margin.left, width - margin.right])
        .domain(d3.extent(lineData, function (d) { return d.date }));

    let yScale = d3.scaleLinear()
        .range([timeline_height - margin.bottom, margin.top])
        .domain(d3.extent(lineData, function (d) { return d.sentiment }));

    let xaxis = d3.axisBottom()
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat('%b %y'))
        .scale(xScale);

    let yaxis = d3.axisLeft()
        .ticks(10)
        .scale(yScale);

    // x axis
    let x_axis_obj = timeline_g.append("g")
        .attr("transform", "translate(" + 0 + "," + (timeline_height - margin.bottom) + ")")
        .call(xaxis);
    timeline_g.append("text")
        .text("Month")
        .style("font-size", "22px")
        .attr("text-anchor", "middle")
        .attr("class", "x label")
        .attr("x", width * 0.5)
        .attr("y", timeline_height - 24);

    // y axis
    let y_axis_obj = timeline_g.append("g")
        .attr("transform", "translate(" + margin.left + "," + 0 + ")")
        .call(yaxis);
    timeline_g.append("text")
        .text("sentiment")
        .style("font-size", "22px")
        .attr("text-anchor", "middle")
        .attr("class", "y label")
        .attr("x", -timeline_height * 0.5)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")

    // draw lines
    let lines_a = timeline_g.append("g")
    lines_a
        .append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return xScale(d.date) })
            .y(function (d) { return yScale(d.sentiment) })
        );

    // draw circles for data points

    // timeline_g.selectAll(".dot")
    //     .data(lineData)
    //     .enter().append("circle") // Uses the enter().append() method
    //     .attr("class", "dot") // Assign a class for styling
    //     .attr("cx", function (d, i) { return xScale(d.date) })
    //     .attr("cy", function (d) { return yScale(d.sentiment) })
    //     .attr("r", 12)
    //     .attr("fill", function (d) { return colorScale(d.sentiment) });

    // draw circles for policies
    let policyData = usPoliciesByState[state];
    timeline_g.selectAll(".dot")
        .data(policyData)
        .enter().append("circle") 
        .attr("class", "dot")
        .attr("cx", function (d, i) { return xScale(d["Date"]) })
        .attr("cy", function (d) { return 100; })
        .attr("r", 12)
        .attr("fill", "#24541a")
        .on("mouseover",function (d, i) {d3.select(this).attr("fill", "#32a883");})
        .on("mouseout", function (d, i) {d3.select(this).attr("fill", "#24541a");})

    // add title

    timeline_g.append("text")
        .attr("text-anchor", "middle")
        .style("font-size", "28px")
        .attr("x", width * 0.5)
        .attr("y", 32)
        .text("average sentiments by month: " + usAbbreviationsDict[state]);

    /* svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + 0.85 * (width) + "," + 0.77 * (height) + ")")
        .call(legend); */

}

function processPolicies(usPoliciesData) {
    let usAbbreviationsDictRev = {};
    for (let stateAbbr in usAbbreviationsDict) {
        usAbbreviationsDictRev[usAbbreviationsDict[stateAbbr]] = stateAbbr;
    }

    const policyDateParser = d3.timeParse("%Y/%m/%d");
    usPoliciesByState = {};
    for (let i = 0; i < usPoliciesData.length; i++) {
        let stateFullname = usPoliciesData[i].State;
        if (!(stateFullname in usAbbreviationsDictRev)) {
            console.log("unknown state: " + stateFullname)
            continue;
        }
        let state = usAbbreviationsDictRev[stateFullname];
        if (!(state in usPoliciesByState)) {
            usPoliciesByState[state] = [];
        }
        let tmp = {"Date": policyDateParser(usPoliciesData[i].Date),
                   "Action Taken": usPoliciesData[i]["Action Taken"]
                    };
        usPoliciesByState[state].push(tmp);
    }
    // sort by date
    for (let state in usPoliciesByState) {
        usPoliciesByState[state].sort(function(a, b) {
            let keyA = a["Date"];
            let keyB = b["Date"];
            if (keyA < keyB) {
                return 1;
            }
            if (keyA > keyB) {
                return -1;
            }
            return 0;
        });
    }
}