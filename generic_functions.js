function None_filter(array){ //deletes string "None" and duplicated instances of an element in an array
  var res= [];
  for (const elemen of array){
   if(elemen != "None" && !res.includes(elemen)){
   res.push(elemen);
   }
  }
  return res;
}
function min_(array){ // custom min function which ignores null values
  var res = [];
  for (const elem of array){ 
    if(elem != null){res.push(elem)}}
  return d3.min(array)
}
function mouseover(){
  //const stroke = d3.select(this).property("stroke");
  d3.select(this).attr("stroke-width",5)
  const n = d3.select(this).attr("data-name")
  const color = d3.select(this).attr("stroke")
  d3.select("#legend").attr("color", color).text(n)
  //d3.select("#"+event.id).attr("color", "black").text(event.text)
}
function mouseout(){
  //const stroke = d3.select(this).property("stroke");
  d3.select("#legend").attr("color", "black").text("Passer la souris sur une courbe pour voir son nom")
  d3.select(this).attr("stroke-width",2)
  //d3.select("#"+event.id).attr("color", "black").text(event.text)
}

function range_month_step(){
  d3.select('div#range_month_step_slider').html(""); //remove all existing slider in the div
  d3.select('p#range_month_step_value').html("");
  const tick_values = [...Array(12).keys()].map(d=> new Date(1970,d,1));
    //"June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
var sliderStep = d3
    .sliderBottom()
    .min(d3.min(tick_values))
    .max(d3.max(tick_values))
    .width(200)
  .step(1000 * 60 * 60 * 24 * 31)//time step of 31 days
    .ticks(6)
    .tickFormat(d3.timeFormat('%b'))
    .tickValues(tick_values)
    .default([new Date(1970,0,1), new Date(1970,11,1)])
	.fill('#2196f3')
    .on('onchange', val => {
      d3.select('p#range_month_step_value').text(val.map(d3.timeFormat('%B')).join(" - "));
    });

  var gStep = d3
    .select('div#range_month_step_slider')
	.attr("class", "curve2_control")
    .append('svg')
    .attr('width', 300)
    .attr('height', 70)
    .append('g')
    .attr('transform', 'translate(30,30)')
	.attr("class", "curve2_control");

  gStep.call(sliderStep);

  d3.select('p#range_month_step_value').attr("class", "curve2_control").text(sliderStep.value().map(d3.timeFormat('%B'))
      .join(' - '));
  return sliderStep;
}