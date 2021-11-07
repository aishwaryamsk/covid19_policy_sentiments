let width = window.innerWidth, height = window.innerHeight, active = d3.select(null);

let geojson = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';
let usStatesDir = '/us.json';
let usAbbrevDir = '/us-state-names.tsv';

// map data 
// all time twitter sentiments
let twitterSentimentsDir = '/twitter_sentiments_by_state.csv';

// Store read data
let usAbbreviations;
let map_g;
let features;

let avgSentimentsByState;

// Transition
zoomStateTime = 900;

// A projection tells D3 how to orient the GeoJSON features
let projection = d3.geoAlbersUsa()
    .scale(900)
    .translate([width / 2, height / 2]);

let path = d3.geoPath().projection(projection);

Promise.all([
    d3.json(usStatesDir),
    d3.tsv(usAbbrevDir),
    d3.csv(twitterSentimentsDir)
]).then(data => {
    let us = data[0];
    usAbbreviations = data[1];

    processDataSets(data[2]);

    features = topojson.feature(us, us.objects.states).features;

    /* Define new color scale */
    var colorScale = getColorScale();

    /* Initialize tooltip */
    var tip = d3.tip()
        .attr("id", "tooltip")
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(function (d) {
            return '<span>' + '<b>' + getCountryObject(d.id).name + '</b>' + '</span>';
        })
        .direction('ne');

    let svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

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
            let code = getCountryObject(d.id).code;
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

    map_g.call(tip);




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



    // Add State labels
    let stateLebels = svg.append("g")
        .selectAll("text")
        .data(features)
        .enter()
        .append("text")
        .attr('class', 'state-names')
        .attr("text-anchor", "middle")
        .text(function (d) {
            return getCountryObject(d.id).code;
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

    // LEGEND
    legend = d3.legendColor()
        .labelFormat(d3.format(".2f"))
        .scale(colorScale);

        console.log(height)
    svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + 0.73*(width) + "," + 0.6*(height) + ")")
        .call(legend);
});

function getCountryObject(id) {
    let country = null;
    usAbbreviations.forEach(countryObj => {
        if (+countryObj.id === +id)
            country = countryObj;
    });
    return country;
}

function handleStateMouseOver(d, i) {
    let centroid = path.centroid(d)
    /* d3.select(this)
    .attr("transform", "translate(" + [-15,-15] + ") scale(" + 1.1 + ")") */
}


// Zoom to state
function handleStateClick(d) {
    // If clicked on an active state, reset it
    if (active.node() === this) return reset();

    // Find bounds of selected state
    let bounds = path.bounds(d);
    dx = bounds[1][0] - bounds[0][0];
    dy = bounds[1][1] - bounds[0][1];
    x = (bounds[0][0] + bounds[1][0]) / 2;
    y = (bounds[0][1] + bounds[1][1]) / 2;

    // Adjust scale of zoom
    scale = 0.4 / Math.max(dx / width, dy / height);

    // Adjust vertical position on page
    translate = [width / 2 - scale * x, height / 3 - scale * y];

    d3.selectAll('.state-names').style("display", "none");

    // Fade all states
    d3.selectAll(".state > path")
        .transition()
        .duration(zoomStateTime)
        .style("opacity", 0);

    // Keep selected state as opaque all states to white
    let activeState = d3.select(this);
    activeState.transition()
        .duration(zoomStateTime).style("opacity", 1)


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



    // Mark the state as not active anymore
    active.classed("active", false);
    active = d3.select(null);
}

function getColorScale() {
    return d3.scaleQuantile()
        .domain([-1, 1])
        .range(['#ef8a62', '#deebf7', '#67a9cf']);
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