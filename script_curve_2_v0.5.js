function main_curve2(countries_codes, raw, list_c = undefined, colorate = undefined){
	//we are assigning all the useful constants and variables
	let list_of_curves = list_c;
	let coloration = colorate;
	
	let dimensions = get_div_dimension("div_curve_2");
	let width = dimensions["width"];
	let height = dimensions["height"];
	let titre_axe_y = "";
	let time_slider_value= get_value_time_slider();
	
	var relatif = 0;
	if(d3.select("#rel_abs2").node() != null){
		relatif = (d3.select("#rel_abs2").node().value == "Relatif") + (d3.select("#rel_abs2").node().value == "day-day %")*2;
	}
	relatif = parseInt(relatif);
	
	
	let dataset_of_datapoints = raw.map(d=>d.filter(d=> d.date>= time_slider_value[0] && d.date <= time_slider_value[1]));
	var dataset = undefined;
	switch(relatif){ // if user asked for relative view
		case 1: // relatif
			dataset = transform_into_relativ(dataset_of_datapoints);
			titre_axe_y = "variation relative";
			break;
		case 0: // absolut
			dataset = replace_0_by_undefined(dataset_of_datapoints);
			let varr = downsize_curve_values(dataset);
			dataset = varr["dataset"];
			let hun_thou_mill = varr["hun_thou_mill"];
			titre_axe_y = "valeur absolue " + "(unité : x e"+ String(hun_thou_mill)+")";
			break;
		case 2: //d-to-d variation
			dataset = transform_in_d_to_d_variation(dataset_of_datapoints);
			titre_axe_y = "variation relative quotidienne";
	}
	
	dataset = dataset.map(dat => dat.filter(d=>(d.action!=undefined) && !isNaN(d.action)));
	
	if(list_c == undefined){list_of_curves = get_curve_selection(countries_codes);}
	if(colorate == undefined){coloration = list_of_curves.map(d=>fill_color_of_selection_block(d, countries_codes));}

	
	if(dataset != [] ){
		let true_dataset = [];
		let true_list_of_curves = [];
		let true_coloration = [];
		
		for (let i=0;i<dataset.length; i++){
			if(dataset[i] != null){
				if(dataset[i].length != 0){
					true_dataset.push(dataset[i]);
					true_list_of_curves.push(list_of_curves[i]);
					true_coloration.push(coloration[i])
				}
			}
		}
		if(true_dataset.length !=0){
			if(true_dataset[0].length !=0){
			console.log("True dataset")
			console.log(true_dataset)
			return plot_line(d3.select("#curve_2"), width, height, true_dataset, true_list_of_curves ,true_coloration,0, {"y":titre_axe_y})
			}
		}
	}
	
	/*
	const shapes = ["circle", "triangle", "cross"];
	const month_names = ["Jan", "Fev", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
	*/
	
  
}