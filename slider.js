let sliderRange;

function sliderInit() {
  let kfmt = "%b-%Y"
  let tfmt = "%b-%d-%Y"

  // Jan: 0, Dec: 11
  let sliderStart = new Date(2020,0,1);
  let sliderEnd = new Date(2021,10,1);

  sliderRange = d3
  .sliderBottom()
  .min(sliderStart)
  .max(sliderEnd)
  .width(window.innerWidth-200)
  .tickFormat(d3.timeFormat(kfmt))
  .ticks(d3.timeMonth.every(1))
  .default([sliderStart, sliderEnd])
  .fill('#2196f3')
  .on('onchange', val => {
    d3.select('p#value-range').text(val.map(d3.timeFormat(tfmt)).join('-'));
  });
  let gRange = d3
    .select('div#slider-range')
    .append('svg')
    .attr('width', window.innerWidth)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');
  gRange.call(sliderRange);

  d3.select('p#value-range').text(
    sliderRange
      .value()
      .map(d3.timeFormat(tfmt))
      .join('-')
  );


  // Time
  var dataTime = d3.range(0, 10).map(function(d) {
    return new Date(1995 + d, 10, 3);
  });

  var sliderTime = d3
    .sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(300)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(dataTime)
    .default(new Date(1998, 10, 3))
    .on('onchange', val => {
      d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
    });

  var gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gTime.call(sliderTime);

  d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));




  
}

function getSliderData() {
  return sliderRange.value()
}

sliderInit();