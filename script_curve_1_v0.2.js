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
async function main_curve1(width=450 ,height=250){
	
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
	
	//adding the select options to the curve's control section for plotting
	d3.selectAll(".first_select").selectAll("option").data(attributes).enter()
		.append("option").text(d=>d);
		
	// ---------------------------------
	// ---------------------------------
	// ---------------------------------
	// ---------------------------------
	// the moment has come for us to begin the plotting 
 
  const colors = ["black", "blue", "red"];
   
  d3.selectAll(".curve1_control").on("change", function (){
	  //gathering the values select by the elements with "first_select" as class name
	d3.select("#curve_for_map").html('');
	const curves_selected = d3.selectAll(".first_select").nodes().map(d=>{return d.value}); 
 
	  
	  // WE HAVE TO TAKE ACCOUNT OF THE CHANGE BETWEEN BOTH VARIABLES
	  
	  var relatif = d3.select("#rel_abs").node().value == "Relatif";//did user ask for a relative or absolute view
	  var list_of_curves = None_filter(curves_selected); // this is the list of name of curves we will have to plot
	  
	  const top_margin = 20 ;//+ list_of_curves.length * 7;//leaving space for the legend
	  const margin = ({top: top_margin, right: 30, bottom: 30, left: 40})
	  var dataset = [];
	  var i=0;
	  // stacking each curve that we have to plot into an array named dataset
	  
	  if(relatif){ // if user asked for relative view
	  var list_of_first_values = [] ; for (const key of list_of_curves){ list_of_first_values.push(raw[0][key])}
	   for (const number_curve of list_of_curves.keys()){
			dataset.push( raw.map(d => {let res={}; const v =list_of_first_values[number_curve]; 
										if(d[list_of_curves[number_curve]] == 0) {res.action = null} // if data missing (here it means =0)
										else {res.action = (d[list_of_curves[number_curve]] - v)/v * 100;}
										res.date = d.date; return res }))
		}
	  }
	  else{ // if user asked for absolute view
		for (const name_curve of list_of_curves){
			  dataset.push( raw.map(d => { let res={}; if(d[name_curve] ==0)// if data missing (here it means =0)
											{res.action = null}else{res.action = d[name_curve]}
										  res.date = d.date; return res; })) }
	  }
	  
	  
	  const svg = d3.select("#curve_for_map").append("svg")
		.attr("width", width)
		.attr("height", height);
	  svg.append("text").attr("x", 0).attr("y",15).attr("id","legend").text("Passer la souris sur une courbe pour voir son nom");
	  
	  const x = d3.scaleTime()
	  .domain(d3.extent(raw, function(d) { 
		return new Date(d.date); 
	  }))
	  .range([margin.left, width - margin.right])
	  
	  const y = d3.scaleLinear()
		.domain([d3.max(dataset.map(d=> d3.max(d.map(e=>{return e.action})))), 
				 min_(dataset.map(d=> min_(d.map(e=>{return e.action}))))]) 
								  //d3.max(dataset, d => d3.max(d)), d3.min(min_filter_array_dict(raw,list_of_curves))
		.range([margin.top, height - margin.bottom])
	  
	const x_step = width/raw.length // step for (**)
	let line = d3.line()
		.y(d =>  y(d.action) - margin.top)
	  .defined(d => { return d.action }) // enables to not take null values into account
	  .x((d, i) => x_step*i) // (**)
	  

	  svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`).selectAll("path")
		.data(dataset)
		.enter()
		.append("path")
		.attr("d", d => line(d))
		.attr("fill", "none")
		.attr("stroke", (d,i) => colors[i])
		.attr("data-name", (d,i)=>list_of_curves[i])
		.attr("stroke-width",2)
		.on( "mouseover",mouseover).on("mouseout", mouseout) //plot the legend  {"text": "BABA", "id" : "legend", "color":"black"}

	//creation of the axis
	let xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b-%Y")).ticks(10)) 

	let yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y))

	  svg.append("g")
		  .call(xAxis);

	  svg.append("g")
		  .call(yAxis);
	  
	  return svg.node()

	})
}