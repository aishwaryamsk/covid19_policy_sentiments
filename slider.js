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
}

function getSliderData() {
  return sliderRange.value()
}

sliderInit();