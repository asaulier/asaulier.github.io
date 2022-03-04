function main_curve3(countries_codes, covid_data, width=450 ,height=250){
	
	const covid_selection = Object.keys(covid_data[0]).filter(d=>(d!= "date" && d!= "iso_code"));
	d3.selectAll("select.covid_data_type_selection").selectAll("option")
	.data(covid_selection)
	.enter()
	.append("option")
	.html(d=>d)
	.attr("value", d=>d);
	// ---------------------------------
	// ---------------------------------
	// ---------------------------------
	// ---------------------------------
	// the moment has come for us to begin the plotting 
   return plot_curve_covid(covid_selection, get_alpha3_selected_countries(countries_codes))
	
	function plot_curve_covid(raw_dataset, list_of_curves){
	  //gathering the values select by the elements with "first_select" as class name
		d3.select("#curve_3").html('');
		//we take into account the time selection
		let time_slider_value= get_value_time_slider();
		let dataset_of_datapoints = raw_dataset.filter(d=> d.date>= time_slider_value[0] && d.date <= time_slider_value[1]);
		const type_of_curve = d3.selectAll(".covid_data_type_selection").node().value;
	  
	  // WE HAVE TO TAKE ACCOUNT OF THE CHANGE BETWEEN BOTH VARIABLES
	  
		var relatif = d3.select("#rel_abs").node().value == "Relatif";//did user ask for a relative or absolute view
		const top_margin = 20 ;//+ list_of_curves.length * 7;//leaving space for the legend
		const margin = ({top: top_margin, right: 30, bottom: 30, left: 40})
		var dataset = [];
		var i=0;
		// stacking each curve that we have to plot into an array named dataset
	  
		
		for (const name_curve of list_of_curves){
			  dataset.push( dataset_of_datapoints.filter(d=>d["iso_code"]==name_curve)
									.map(d => { let res={}; if(d[type_of_curve] ==0)// if data missing (here it means =0)
											{res.action = null}
										else{res.action = d[type_of_curve]}
										  res.date = d.date; return res; })) }
	  
	  
	  
	  const svg = d3.select("#curve_3").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("border", "solid")
		.style("border-width", "2px");
	  
	  svg.append("text").attr("x", 0).attr("y",15).attr("id","legend").text("Passer la souris sur une courbe pour voir son nom");
	  
	  const x = d3.scaleTime()
	  .domain(d3.extent(dataset_of_datapoints, function(d) { 
		return new Date(d.date); 
	  }))
	  .range([margin.left, width - margin.right])
	  
	  const y = d3.scaleLinear()
		.domain([d3.max(dataset.map(d=> d3.max(d.map(e=>{return e.action})))), 
				 min_(dataset.map(d=> min_(d.map(e=>{return e.action}))))]) 
								  //d3.max(dataset, d => d3.max(d)), d3.min(min_filter_array_dict(raw,list_of_curves))
		.range([margin.top, height - margin.bottom])
	  
	const x_step = (width - margin.right - margin.left)/dataset_of_datapoints.length // step for (**)
	
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
		//.on( "mouseover",mouseover).on("mouseout", mouseout) //plot the legend  {"text": "BABA", "id" : "legend", "color":"black"}

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
		  
	/*
	// implementation of the cursor 
	 // This allows to find the closest X index of the mouse:
		var bisect = d3.bisector(function(d) { return d.x; }).left;
		var focuss = svg
			.append('g')
			.append('line')
			.style("fill", "none")
			.attr("stroke", "black")
			.style("opacity", 0)
		var focusText = svg
			.append('g')
			.append('text')
			  .style("opacity", 0)
			  .attr("text-anchor", "left")
			  .attr("alignment-baseline", "middle")

			// Create a rect on top of the svg area: this rectangle recovers mouse position
		  svg
			.append('rect')
			.style("fill", "none")
			.style("pointer-events", "all")
			.attr('width', width)
			.attr('height', height)
			.on('mouseover', mouseover_cursor)
			.on('mousemove', e=>mousemove_cursor(e))
			.on('mouseout', mouseout_cursor);


		  // What happens when the mouse move -> show the annotations at the right positions.
		  function mouseover_cursor() {
			focuss.style("opacity", 1)
			focusText.style("opacity",1)
		  }

		  function mousemove_cursor(evenement) {
			// recover coordinate we need
			var x0 = x.invert(d3.pointer(evenement)[0]);
			let ticks_abscisse = dataset_of_datapoints.map(d=>d.date);
			var i = bisect(ticks_abscisse, x0, 1);
			selectedData = data[i]
			focuss
			  .attr("cx", x(selectedData.x))
			  .attr("cy", y(selectedData.y))
			focusText
			  .html("x:" + selectedData.x + "  -  " + "y:" + selectedData.y)
			  .attr("x", x(selectedData.x)+15)
			  .attr("y", y(selectedData.y))
			}
		  function mouseout_cursor() {
			focus.style("opacity", 0)
			focusText.style("opacity", 0)
		  }
		*/
			  
			  
	  return svg.node()
	}
	
}