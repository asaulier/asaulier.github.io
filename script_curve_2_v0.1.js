async function fetch_raw() {
  return d3.csv("https://raw.githubusercontent.com/asaulier/dataviz_project/main/first_collection_export.csv", d => {
  let res = {}
  res.Bourse_Japon = +d.topix_open
  res.Bourse_Europe =+d.euro_open
  res.NYSE = +d.sp500_open
  res.Nasdaq = +d.nasdaq_open
  res.Shanghai = +d.sse_open
  res.Tradingvol_Tokyo = +d.topix_volume
  res.Tradingvol_Euronext = +d.euro_volume
  res.Tradingvol_NYSE = +d.sp500_volume
  res.Tradingvol_Nasdaq = +d.nasdaq_volume
  res.Tradingvol_Shanghai = +d.sse_volume
  res.date = d3.timeParse("%d/%m/%Y")(d.date)
  return res
})}
async function main_curve2(width = 500, height=250){
	//we are assigning all the useful constants and variables
	let total_raw = await fetch_raw();
	total_raw = await total_raw;
	let raw = total_raw.map(function nimportequoi(d){
		let res = {}
	  res.Bourse_Japon = d.Bourse_Japon
	  res.Bourse_Europe =d.Bourse_Europe
	  res.NYSE = d.NYSE
	  res.Nasdaq = d.Nasdaq
	  res.Shanghai = d.Shanghai
	  res.date = d.date
	  return res
	});
	let raw_volume = total_raw.map(function nimportequoi(d){
		let res = {}
	  res.Tradingvol_Tokyo = d.Tradingvol_Tokyo
	  res.Tradingvol_Euronext =d.Tradingvol_Euronext
	  res.Tradingvol_NYSE = d.Tradingvol_NYSE
	  res.Tradingvol_Nasdaq = d.Tradingvol_Nasdaq
	  res.Tradingvol_Shanghai = d.Tradingvol_Shanghai
	  res.date = d.date
	  return res
	});
	let attributes = Object.keys(raw[0]).slice(0,Object.keys(raw[0]).length- 1); 
	attributes.unshift("None");
	let attributes_volume = Object.keys(raw_volume[0]).slice(0,Object.keys(raw_volume[0]).length- 1); 
	attributes_volume.unshift("None");
	let correspond_for_volume = [...Array(attributes.length-1).keys()].map(d=>d+1).reduce(function(obj, x) {
		obj[attributes_volume[x]] = attributes[x];
			return obj;
		}, {});
	// adding the select and control panels for curve_2
	// [... new Set(array)] removes the duplicated values from the array
	d3.select("#curve2_control").html( 
			'<p id="titre_scatter">Trading volume</p> ' + 
			'<div class="row"> '+
				'<div class="pile_up">'+
					'<p>Year : </p><select id="second_select_year" class="curve2_control">' +
					[...new Set(raw_volume.map(d =>d.date.getFullYear()))].map( d=> '<option>'+d+'</option>' ).join("") +'</select>' +
				'</div>'+
				'<div class="pile_up">'+
					'<p> Curves: </p>'+
					'<div class="row"> '+
						'<select class="second_select curve2_control">' + attributes_volume.map(d => '<option>'+d+'</option>' ).join("") + '</select>' +
						'<select class="second_select curve2_control"> ' + attributes_volume.map(d => '<option>'+d+'</option>' ).join("") + '</select>' +
						'<select class="second_select curve2_control">' + attributes_volume.map(d => '<option>'+d+'</option>' ).join("") + '</select>'+
					'</div>'+
				'</div>'+
			'</div>'+
			'<div class="pile_up align-items-center">'+
			'<div class="col-sm-2"><p id="range_month_step_value"></p></div>'+
			'<div class="col-sm"><div id="range_month_step_slider" class=""></div></div>'+
			'</div>'
			)
	//creating the slider in order to select the range of months
	let slider = range_month_step();
	
	const colors = ["black", "blue", "red", "#800000", "#FFA500", "#DAA520", "#FFD700", "#7CFC00", "#00FFFF", "#9400D3", "#FF1493", "#C0C0C0"];
	const shapes = ["circle", "triangle", "cross"];
	const month_names = ["Jan", "Fev", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

  //Beginning of the on 
  
  function build_svg(){
	  
	d3.select("#curve_2").html("")
  //gathering the values select by the elements with "first_select" as class name
  
  const curves_selected = d3.selectAll(".second_select").nodes().map(d=>{return d.value});  
  const months_edge = slider.value() // of the form [0,5] as in the limit (included) of the month selection
              .map(d=>{ if(typeof d == "object"){return d.getMonth()}
                      else{return Math.floor(d/1000/3600/24/31) + 1}});
  const number_of_months = months_edge[1] - months_edge[0]+1;
  // BE CAREFUL WITH months_edge, solution to retrieve the correct months hinges on the value of step from range_month_step
  const plot_year = parseInt(d3.select("#second_select_year").node().value); // the year during which we have to plot data points
  const list_of_curves = None_filter(curves_selected); // this is the list of name of curves we will have to plot
  const spacing_between_legend_lines = 20;
  const top_margin = list_of_curves.length * spacing_between_legend_lines ;//+ list_of_curves.length * 7;//leaving space for the legend
  const margin = ({top: top_margin, right: 30, bottom: 30, left: 40})
  var dataset = [];
  var i=0;
  // stacking each curve that we have to plot into an array named dataset
  
   // if user asked for absolute view
    for (const name_curve of list_of_curves){
          dataset.push( raw_volume.map(d => { let res={}; 
                    if(d.date.getMonth()>months_edge[1] || d.date.getMonth()<months_edge[0] || d.date.getFullYear() != plot_year)
                            // not filtering missing data because it means no trading (d[name_curve] ==0) 
                              // the data point's month or year do not match user selection
                            {res.action = null}
                   else{res.action = d[name_curve]} // if data is meant to be plotted
                                      res.date = d.date; return res; })
                      .filter(d=> d["action"] != null) // let's delete all data that is not used
                      ) }

  
//let's plot the data between 0 and 100'000
  const hun_thou_mill = d3.max(dataset.map(great_array=>
                                  Math.floor(Math.log10(d3.max(great_array.map(d=> {return d.action})))))) //int(log10(max(nasdaq_volume)))
  //hun_thou_mill = hundreds, thousands or millions ? 
  dataset = dataset.map(great_array => {
                          // we change the numbers to keep them under ... 
                              return great_array.map(d => {var data_point = d;
                                                          data_point.action = d.action*10**(4 - hun_thou_mill);
                                                           return data_point
                                                          })});
  //setting title
  d3.select("#titre_scatter").text("Trading volume (unités: " + String(10**(hun_thou_mill-4)) + " d'actions)");

// telling what the shape of the datapoint should be on the board
  //for (const iter in dataset){ dataset[iter] = dataset[iter].map(d=>{  d.shape = shapes[iter];return d})} //assigning through "shape" attribute
  
  const svg = d3.select("#curve_2").append("svg")
    .attr("width", width)
    .attr("height", height)

  svg.append("text").attr("x", 0).attr("y",15).attr("id","legend").text("");
  
  const x = d3.scaleLinear()
    .domain([1, 31]) // set max day number from database
  .range([margin.left, width - margin.right])
  
  const y = d3.scaleLinear()
    .domain([d3.max(dataset.map(d=> d3.max(d.map(e=>{return e.action})))), 
             min_(dataset.map(d=> min_(d.map(e=>{return e.action}))))]) 
                              //d3.max(dataset, d => d3.max(d)), d3.min(min_filter_array_dict(raw,list_of_curves))
    .range([margin.top, height - margin.bottom])
  
const x_step = width/31; // step for (**)

  //plotting the first curves of the dataset
  svg.selectAll("circle").attr("transform", `translate(${margin.left}, ${margin.top})`)
    .data(dataset[0]) //first element
    .enter()
    .append("circle")
    .attr("cx", d => x(d.date.getDate()))
    .attr("cy", d => y(d.action))
    .attr("r", 3)
    .attr("fill", d => colors[d.date.getMonth() - months_edge[0]]) 

  
if(dataset.length>1){
  svg.selectAll("g.polygon_plot").attr("transform", `translate(${margin.left}, ${margin.top})`)
    .data(dataset.slice(1))//exclude the first element of dataset
    .enter()
    .append('g')
    .each(function(d,i){ //dataset = [Data_tokyo, Data_euronext, ...] so we need to group them to plot them seperatly
      d3.select(this)
      .selectAll('polygon')
      .data(d).enter().append("polygon")//d=>{if(d.shape=="circle"){return d.shape} else{return "polygon"}})
    .attr("points", d => { return triangle(  {x:x(d.date.getDate()),y:y(d.action)}, 6)})
    .attr("fill", d => colors[(i+1)*number_of_months+d.date.getMonth() - months_edge[0]])
    })}
    
//creation of the axis
let xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x)) 

let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);
  
  //LEGEND FOR THE CIRCLES
 const month_names_for_legend =  [...Array(number_of_months).keys()].map(d=> month_names[d+months_edge[0]]);
const first_color_indexes = [...Array(number_of_months).keys()];
  const spacing_legend = 150;
  svg.selectAll("g.legend1").data(first_color_indexes).enter().append("circle")
    .attr("cx",d=> d*spacing_legend+50)
    .attr("cy",d=>5).attr("r", 5).style("fill", d=>colors[d]);
  svg.selectAll("text.legend1").data(first_color_indexes).enter()
    .append("text") .attr("x", d=> d*spacing_legend+60).attr("y", 5)
    .text(d=>month_names_for_legend[d] + ", " +  correspond_for_volume[list_of_curves[0]]).style("font-size", "10px").attr("alignment-baseline","middle");

  //LEGEND FOR THE OTHERS
  if(list_of_curves.length>1){
  const other_color_indexes = [...Array((list_of_curves.length-1) * number_of_months).keys()].map(d=>number_of_months+d);
    //plotting triangle
  svg.selectAll("g.legend2").data(other_color_indexes).enter().append("polygon")
    .attr("points", d => { return triangle(  {x:((d-number_of_months)%number_of_months) *spacing_legend+50 ,
                                              y:spacing_between_legend_lines*(Math.floor(d/number_of_months))}, 6)})
    .attr("fill", d => colors[d]);
    //plotting text
    svg.selectAll("text.legend2").data(other_color_indexes).enter()
    .append("text") .attr("x", d=> ((d-number_of_months)%number_of_months) *spacing_legend+50 +5)
      .attr("y", d=> spacing_between_legend_lines*(Math.floor(d/number_of_months)))
    .text(d=>month_names_for_legend[d%number_of_months] + ", " +  correspond_for_volume[list_of_curves[Math.floor(d/number_of_months)]])
      .style("font-size", "10px").attr("alignment-baseline","middle");
  }
  return svg.node() 
  }
  
   d3.selectAll(".curve2_control").on("change", build_svg);
   slider.on("onchange",build_svg);
}