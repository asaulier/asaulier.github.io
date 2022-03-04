function main_curve2(countries_codes, raw, width = 500, height=250){
	//we are assigning all the useful constants and variables

	let raw_volume= raw.map(function nimportequoi(d){
	  return Object.assign( {}, d.volume, {"date":d.date}) //merge the two dictionnaries
	});
	
		
		
	
	const colors = ["black", "blue", "red", "#800000", "#FFA500", "#DAA520", "#FFD700", "#7CFC00", "#00FFFF", "#9400D3", "#FF1493", "#C0C0C0"];
	const shapes = ["circle", "triangle", "cross"];
	const month_names = ["Jan", "Fev", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

	return build_svg()
  
  function build_svg(){
	  
	d3.select("#curve_2").html("")
  //gathering the values select by the elements with "first_select" as class name
  
  const list_of_curves = get_curve_selection(countries_codes); // this is the list of name of curves we will have to plot
  let time_slider_value= get_value_time_slider();
  let raw_volume_filtered = raw_volume.filter(d=> d.date>= time_slider_value[0] && d.date <= time_slider_value[1]);
	
  const top_margin = 30;//+ list_of_curves.length * 7;//leaving space for the legend
  const margin = ({top: top_margin, right: 30, bottom: 30, left: 40})
  var dataset = [];
  // stacking each curve that we have to plot into an array named dataset
  var relatif = d3.select("#rel_abs2").node().value == "Relatif";//did user ask for a relative or absolute view
		
   // if user asked for absolute view
   if(relatif){
	   var list_of_first_values = [] ; for (const key of list_of_curves){ list_of_first_values.push(raw_volume_filtered[0][key])}
		for (const number_curve of list_of_curves.keys()){
			dataset.push( raw_volume_filtered.map(d => {let res={}; const v =list_of_first_values[number_curve]; 
										if(d[list_of_curves[number_curve]] == 0) {res.action = null} // if data missing (here it means =0)
										else {res.action = (d[list_of_curves[number_curve]] - v)/v * 100;}
										res.date = d.date; return res }))
   }}
   else{
   for (const name_curve of list_of_curves){
			  dataset.push( raw_volume_filtered.map(d => { let res={}; if(d[name_curve] ==0)// if data missing (here it means =0)
											{res.action = null}else{res.action = d[name_curve]}
										  res.date = d.date; return res; })) }
   
  
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
   }
// telling what the shape of the datapoint should be on the board
  //for (const iter in dataset){ dataset[iter] = dataset[iter].map(d=>{  d.shape = shapes[iter];return d})} //assigning through "shape" attribute
  
	  const svg = d3.select("#curve_2").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("border", "solid")
		.style("border-width", "2px");

	  svg.append("text").attr("x", 0).attr("y",15).attr("id","legend").text("");
		if(dataset.length >=1){
			
			
			const x = d3.scaleTime()
			  .domain(d3.extent(dataset[0], function(d) { 
				return new Date(d.date); 
			  }))
			  .range([margin.left, width - margin.right]);
		  
			const y = d3.scaleLinear()
			.domain([d3.max(dataset.map(d=> d3.max(d.map(e=>{return e.action})))), 
					 min_(dataset.map(d=> min_(d.map(e=>{return e.action}))))]) 
									  //d3.max(dataset, d => d3.max(d)), d3.min(min_filter_array_dict(raw,list_of_curves))
			.range([margin.top, height - margin.bottom]);
		  
			const x_step = (width - margin.right - margin.left)/dataset[0].length; // step for (**)
				
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
			.attr("stroke", (d,i) => fill_color_of_selection_block(list_of_curves[i], countries_codes))
			.attr("data-name", (d,i)=>list_of_curves[i])
			.attr("stroke-width",2)
			//.on( "mouseover",mouseover).on("mouseout", mouseout)

				
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
			  
			  
	      }
	  return svg.node() 
	  }
	  
   
}