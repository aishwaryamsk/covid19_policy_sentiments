let width = window.innerWidth - 150, height = window.innerHeight, active = d3.select(null);

// Timeline // for both map and line - 50% height each
let timeline_width = window.innerWidth, timeline_height = window.innerHeight / 2;

var margin = { top: 15, right: 70, bottom: 60, left: 50 }

let geojson = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';
let usStatesDir = '/datasets/us.json';
let usAbbrevDir = '/datasets/us-state-names.tsv';
let usPolicyDir = '/datasets/states_policies_clean.tsv';
let sentimentsDir = '/datasets/all_twitter_data.tsv';

// map data 
// all time twitter sentiments
let twitterSentimentsDir = '/datasets/twitter_sentiments_by_state.csv';
let covidCasesDir = '/datasets/United_States_COVID-19_Cases_and_Deaths_all_States_over_Time.csv'

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
let covidByState;
// let colorScale;
let legend;



// SVGs
let svg_map, svg_timeline, svg_covid_timeline;

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
    d3.csv(covidCasesDir),
    d3.tsv(usPolicyDir),
    //d3.tsv(sentimentsDir)
]).then(data => {
    let us = data[0];
    usAbbreviations = data[1];
    twitterSentiments = data[2];
    usAbbreviationsDictInit();
    processDataSets(firstDay, lastDay); // replace start and end with true start and end timestamps originally
    processDataSetsTimeline(data[2]);

    processDataSetsCovid(data[3]);
    console.log("covid by state processed");
    processPolicies(data[4]);

    //console.log(data[5][1]);

    // Map
    svg_map = d3.select("#map")
        .attr("width", width)
        .attr("height", height);
    drawMap(svg_map, us);

    // Add legend
    addLegend();

    // Timeline
    svg_timeline = d3.select("body").append("svg")
        .attr('id', 'timeline')
        .attr("width", timeline_width)
        .attr("height", timeline_height);
    svg_covid_timeline = d3.select("body").append("svg")
        .attr('id', 'timeline_covid')
        .attr("width", width)
        .attr("height", timeline_height);

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
        //.attr('fill', '#ccc')
        .attr("fill", function (d) {
            // Associated sentiment for this state
            let code = getStateObj(d.id).code;
            // Remove DC - District of Columbia is not a state
            if (code != 'DC')
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
    let zoomScale = 0.4;
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

    /* SHOW TIMELINE */
    drawTimeLine(svg_timeline, getStateObj(features[i].id).code);
    drawTimeLineCovid(svg_covid_timeline, getStateObj(features[i].id).code);
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


function processDataSetsCovid(covidData) {
    // Compute cumulative sentiments by state
    console.log('printing covid data')
    //console.log(covidData)
    const parseTime = d3.timeParse("%Y/%e/%d");

    covidByState = {};
    for (let i = 0; i < covidData.length; i++) {
        if (!covidByState[covidData[i].state_abbr]) {
            // console.log("date", covidData[i].submission_date_format);
            // console.log(parseTime(covidData[i].submission_date_format));
            covidByState[covidData[i].state_abbr] =
                { 'dates': [+parseTime(covidData[i].submission_date_format)], 'new_cases': [+covidData[i].new_case] }
        } else {
            covidByState[covidData[i].state_abbr]['dates'].push(+parseTime(covidData[i].submission_date_format))
            covidByState[covidData[i].state_abbr]['new_cases'].push(+covidData[i].new_case)
            // console.log(parseTime(covidData[i].submission_date_format));
        }
    }
    console.log(covidByState)

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


function processDataSetsTimeline(twitterSentiments) {
    // Compute cumulative sentiments by state and Year, Month
    let cumulativeSentimentsByStateYearMonth = {};
    let cumulativeSentimentsByStateYearMonthDay = {};
    for (let i = 0; i < twitterSentiments.length; i++) {
        // for (let i = 0; i < 10; i++) {
        let tmpDate = new Date(parseInt(twitterSentiments[i].timestamp + '000'));
        let year = tmpDate.getFullYear();
        let month = tmpDate.getMonth() + 1;
        let day = tmpDate.getDay();
        let yearMonth = year.toString() + "," + month.toString();
        let yearMonthDay = yearMonth + "," + day.toString();


        //---------- MONTH
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


        //----------DAY
        if (!cumulativeSentimentsByStateYearMonthDay[twitterSentiments[i].state]) {
            cumulativeSentimentsByStateYearMonthDay[twitterSentiments[i].state] = {};
        }
        if (!cumulativeSentimentsByStateYearMonthDay[twitterSentiments[i].state][yearMonthDay]) {
            cumulativeSentimentsByStateYearMonthDay[twitterSentiments[i].state][yearMonthDay] =
                { 'sentiment': [+twitterSentiments[i].sentiment] };
        } else {
            cumulativeSentimentsByStateYearMonthDay[twitterSentiments[i].state][yearMonthDay]['sentiment']
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
    // Compute average sentiments by state and Year, Month, Day
    avgSentimentsByStateYearMonthDay = {};
    for (let state in cumulativeSentimentsByStateYearMonthDay) {
        avgSentimentsByStateYearMonthDay[state] = {}
        for (let yearMonthDay in cumulativeSentimentsByStateYearMonthDay[state]) {
            avgSentimentsByStateYearMonthDay[state][yearMonthDay] = avg(cumulativeSentimentsByStateYearMonthDay[state][yearMonthDay]['sentiment']);
        }
    }


}



function drawTimeLine(svg, state) {
    // <<<<<<< brando
    //     console.log("Drawing timeline", state)
    // =======
    //     var elementExists = document.getElementById("timeline_g");
    //     if (elementExists) {
    //         elementExists.remove();
    //     }

    // >>>>>>> main
    let sentimentsYM = avgSentimentsByStateYearMonth[state];
    let sentimentsYMD = avgSentimentsByStateYearMonthDay[state];


    const monthParser = d3.timeParse("%Y,%m");
    const dayParser = d3.timeParse("%Y,%m,%d");
    let lineDataDay = [];
    let lineData = [];

    for (let yearMonth in sentimentsYM) {
        let dt = monthParser(yearMonth);

        lineData.push({ date: dt, sentiment: sentimentsYM[yearMonth], ts: dt.getTime() });
    }
    for (let yearMonthDay in sentimentsYMD) {
        let dt = dayParser(yearMonthDay);
        lineDataDay.push({ date: dt, sentiment: sentimentsYMD[yearMonthDay] });
    }

    function sortByDateAscending(a, b) {
        return a.date - b.date;
    }

    lineDataDay = lineDataDay.sort(sortByDateAscending);

    let timeline_g = svg.append("g")
        .attr("id", "timeline_g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    let timeline_g2 = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top * 2 + ")");

    let xScale = d3.scaleTime()
        .range([margin.left, timeline_width - margin.right])
        .domain(d3.extent(lineData, function (d) { return d.date }));

    let yScale = d3.scaleLinear()
        .range([timeline_height - margin.bottom, margin.top])
        .domain(d3.extent(lineData, function (d) { return d.sentiment }));

    let xScale2 = d3.scaleTime()
        .range([margin.left, width - margin.right])
        .domain(d3.extent(lineDataDay, function (d) { return d.date }));

    let yScale2 = d3.scaleLinear()
        .range([timeline_height - margin.bottom, margin.top])
        .domain(d3.extent(lineDataDay, function (d) { return d.sentiment }));


    let xaxis = d3.axisBottom()
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat('%b %y'))
        .scale(xScale);
    let xaxis2 = d3.axisBottom()
        .ticks(d3.timeDay.every(1))
        .tickFormat(d3.timeFormat('%b %y'))
        .scale(xScale2);

    let yaxis = d3.axisLeft()
        .ticks(10)
        .scale(yScale);
    let yaxis2 = d3.axisLeft()
        .ticks(10)
        .scale(yScale2);

    // x axis
    let x_axis_obj = timeline_g.append("g")
        .attr("transform", "translate(" + 0 + "," + (timeline_height - margin.bottom) + ")")
        .call(xaxis);
    timeline_g.append("text")
        .text("Month")
        .style("font-size", "22px")
        .attr("text-anchor", "middle")
        .attr("class", "x label")
        .attr("x", timeline_width * 0.5)
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
    // create a tooltip
    let tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .attr("id", "tooltip")
        .offset([-8, 0])
        .html("(tool_tip)")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("font-size", "24px")
    svg.call(tool_tip);

    let policyData = usPoliciesByState[state];

    let smallCircleSize = 9;
    let largeCircleSize = 20;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    timeline_g.selectAll(".dot")
        .data(policyData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", function (d, i) { return xScale(d["Date"]) })
        .attr("cy", function (d) {
            let ts = d["Date"].getTime();
            if (ts <= lineData[0].ts) {
                return yScale(lineData[0].sentiment);
            } else if (ts >= lineData[lineData.length - 1].ts) {
                return yScale(lineData[lineData.length - 1].sentiment);
            }
            for (let i = 1; i < lineData.length; i++) {
                let lts = lineData[i - 1].ts;
                let rts = lineData[i].ts;
                if (ts >= lts && ts <= rts) {
                    // interpolate
                    let delta = (ts - lts) / (rts - lts);
                    let left = lineData[i - 1].sentiment;
                    let right = lineData[i].sentiment;
                    return yScale(left + delta * (right - left));
                }
            }
            return 100;
        })
        .attr("r", smallCircleSize)
        .attr("fill", "#ffffff")
        .attr("stroke", "#24541a")
        .attr("stroke-width", 2.5)
        .on("mouseover", function (d, i) {
            d3.select(this).attr("stroke", "#32a883");
            let cont = d.mmddyyyy + "<br>";
            // make it multiple lines
            let lineMaxLen = 40; // maximum 40 chars per line
            cont += getMultipleLinesHTML(d["Action Taken"], lineMaxLen);
            tool_tip.html(cont);
            tool_tip.show();
            d3.select(this).attr("r", largeCircleSize);
        })
        .on("mouseout", function (d, i) {
            d3.select(this).attr("stroke", "#24541a");
            tool_tip.hide();
            d3.select(this).attr("r", smallCircleSize);
        })
    // "#32a883" "#24541a"

    // add title

    timeline_g.append("text")
        .attr("text-anchor", "middle")
        .style("font-size", "28px")
        .attr("x", width * 0.5)
        .attr("y", 32)
        .text("average sentiments by month: " + usAbbreviationsDict[state]);
}





function drawTimeLineCovid(svg, state) {
    console.log("Drawing timeline", state)
    let sentimentsYMD = covidByState[state];

    // const dayParser = d3.timeParse("")
    // const monthParser = d3.timeParse("%Y,%m");
    // const dayParser = d3.timeParse("%Y,%m,%d");
    let lineDataDay = [];

    for (i = 0; i < sentimentsYMD.length; i++) {
        let dt = sentimentsYMD['dates'][i];
        let new_cases = sentimentsYMD['new_cases'][i];
        console.log(dt)
        lineDataDay.push({ date: dt, cases: new_cases });
    }

    function sortByDateAscending(a, b) {
        return a.date - b.date;
    }

    lineDataDay = lineDataDay.sort(sortByDateAscending);

    let timeline_g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let xScale = d3.scaleTime()
        .range([margin.left, width - margin.right])
        .domain(d3.extent(lineDataDay, function (d) { return d.date }));

    let yScale = d3.scaleLinear()
        .range([timeline_height - margin.bottom, margin.top])
        .domain(d3.extent(lineDataDay, function (d) { return d.cases }));


    let xaxis = d3.axisBottom()
        .ticks(d3.timeDay.every(1))
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
        .text("Day")
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
        .text("New Cases")
        .style("font-size", "22px")
        .attr("text-anchor", "middle")
        .attr("class", "y label")
        .attr("x", -timeline_height * 0.5)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")

    // draw lines
    let lines_a = timeline_g.append("g");
    lines_a
        .append("path")
        .datum(lineDataDay)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return xScale(d.date) })
            .y(function (d) { return yScale(d.cases) })
        );

    // draw circles for data points

    timeline_g.selectAll(".dot")
        .data(lineDataDay)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function (d, i) { return xScale(d.date) })
        .attr("cy", function (d) { return yScale(d.cases) })
        .attr("r", 12)
        .attr("fill", function (d) { return colorScale(d.cases) });

    // add title

    timeline_g.append("text")
        .attr("text-anchor", "middle")
        .style("font-size", "28px")
        .attr("x", timeline_width * 0.5)
        .attr("y", 32)

        .text("Daily New Cases: " + usAbbreviationsDict[state]);

    /* svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + 0.85 * (width) + "," + 0.77 * (height) + ")")
        .call(legend); */
}



function getMultipleLinesHTML(noHTMLText, lineMaxLen) {
    if (lineMaxLen <= 2) {
        return "";
    }
    let tokens = noHTMLText.split(' ').filter(function (e) { return e != ""; });
    // let ret = "";
    // for (let i = 0; i < noHTMLText.length; i += lineMaxLen) {
    //     ret += noHTMLText.substring(i, i+lineMaxLen) + "<br>";
    // }
    let ret = "";
    let currentLine = "";
    let i = 0;
    while (i < tokens.length) {
        let token = tokens[i];
        let j = 0;
        if (currentLine.length == 0) {
            while ((token.length - j) > lineMaxLen) {
                ret += token.substring(j, j + lineMaxLen - 1) + "-<br>";
                j += lineMaxLen - 1;
            }
            currentLine += token.substring(j);
            i += 1;
        } else {
            let remaining = lineMaxLen - currentLine.length - 1;
            if (token.length <= remaining) {
                currentLine += " " + token;
                i += 1;
            } else {
                ret += currentLine + "<br>";
                currentLine = "";
                // don't increase i
            }
        }
    }
    if (currentLine.length > 0) {
        ret += currentLine + " <br>";
        currentLine = "";
    }


    return ret;
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
        let tmpDate = policyDateParser(usPoliciesData[i].Date);
        let tmp = {
            "Date": tmpDate,
            "Action Taken": usPoliciesData[i]["Action Taken"],
            "yyyymmdd": usPoliciesData[i].Date,
            "mmddyyyy": (tmpDate.getMonth() + 1) + '/' + tmpDate.getDate() + '/' + tmpDate.getFullYear()
        };
        usPoliciesByState[state].push(tmp);
    }
    // sort by date
    for (let state in usPoliciesByState) {
        usPoliciesByState[state].sort(function (a, b) {
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