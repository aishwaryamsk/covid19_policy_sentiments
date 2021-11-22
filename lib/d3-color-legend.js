// REFERENCE: http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9f

var colorScale = d3.scaleLinear()
    .domain([-1, 0, 1])
    .range(['#ef8a62', '#deebf7', '#67a9cf']);

function addLegend(selector_id) {
    var legendheight = 120,
        legendwidth = 110, // width of legend
        legendBandWidth = 80 // width of legend band
        margin_legend = { top: 30, right: 60, bottom: 10, left: 2 };

    var canvas = d3.select(selector_id)
        .style("height", legendheight + "px")
        .style("width", legendwidth + "px")
        .style("position", "absolute")
        .append("canvas")
        .attr("height", legendheight - margin_legend.top - margin_legend.bottom)
        .attr("width", 1)
        .style("height", (legendheight - margin_legend.top - margin_legend.bottom) + "px")
        .style("width", (legendBandWidth - margin_legend.left - margin_legend.right) + "px")
        //.style("border", "1px solid #000")
        .style("position", "absolute")
        .style("top", (margin_legend.top) + "px")
        .style("left", ((legendwidth-legendBandWidth)+margin_legend.left) + "px")
        .node();

    var ctx = canvas.getContext("2d");

    var legendscale = d3.scaleLinear()
        .range([legendheight - margin_legend.top - margin_legend.bottom, 1])
        .domain([-1, 1]) // set the min and max of the domain (sentiments here)

    var image = ctx.createImageData(1, legendheight);
    d3.range(legendheight).forEach(function (i) {
        var c = d3.rgb(colorScale(legendscale.invert(i)));
        image.data[4 * i] = c.r;
        image.data[4 * i + 1] = c.g;
        image.data[4 * i + 2] = c.b;
        image.data[4 * i + 3] = 255;
    });
    ctx.putImageData(image, 0, 0);

    var legendaxis = d3.axisRight()
        .scale(legendscale)
        //.tickSize(0)
        .ticks(2)
        .tickFormat(function (d) {
            if (d === -1)
                return 'Negative';
            else if (d === 0)
                return 'Neutral';
            else if (d === 1)
                return 'Positive';
        });

    var svg = d3.select(selector_id)
        .append("svg")
        .attr("height", (legendheight) + "px")
        .attr("width", (legendwidth) + "px")
        .style("position", "absolute")
        .style("right", "0px")
        .style("top", "0px")

    svg.append("text")
        .text("Average Sentiment")
        .attr('x', '10px')
        .attr('y', '15px')
        .attr("text-anchor", "right")
        .attr("font-size", "13px");
    svg
        .append("g")
        .attr("class", "legend-axis")
        .attr("transform", "translate(" + (legendwidth - margin_legend.left - margin_legend.right + 3) + "," + (margin_legend.top) + ")")
        .call(legendaxis);


};