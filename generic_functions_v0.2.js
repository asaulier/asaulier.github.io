
function None_filter(array){ //deletes string "None" and duplicated instances of an element in an array
  var res= [];
  for (const elemen of array){
   if(elemen != "None" && !res.includes(elemen)){
   res.push(elemen);
   }
  }
  return res;
}
function invert_dict(dict_){
	return Object.fromEntries(Object.entries(dict_).map(a => a.reverse()))
}
function find_key(dict_, value){
	let i = Object.values(dict_).indexOf(value);
	return Object.keys(dict_)[i]
}
function replace_keys_in_dict(dict, dict_replacement){
	let res={};
	let keys = Object.keys(dict);
	for (const key of keys){
		res[dict_replacement[key]] = dict[key]
	}
	return 
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

function range_month_step(width,height=70){
  d3.select('div#range_month_step_slider').html(""); //remove all existing slider in the div
  d3.select('p#range_month_step_value').html("");
  const tick_values = [...Array(12).keys()].map(d=> new Date(1970,d,1));
    //"June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
var sliderStep = d3
    .sliderBottom()
    .min(d3.min(tick_values))
    .max(d3.max(tick_values))
    .width(width-50)
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
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(15,10)')
	.attr("class", "curve2_control");

  gStep.call(sliderStep);

  d3.select('p#range_month_step_value').attr("class", "curve2_control").text(sliderStep.value().map(d3.timeFormat('%B'))
      .join(' - '));
  return sliderStep;
}

function great_time_range(w,h=60){
  const limit_low = new Date(2019, 9,1);
  const limit_high = new Date(2022,0,1);
  const width = w-20
  const height = h;
  var ticks_time = [];
  for (let annee = limit_low.getFullYear(); annee <= limit_high.getFullYear(); annee++){
	  ticks_time = ticks_time.concat(d3.range(0,12).map(d=> new Date(annee, d, 1)));
  }
  ticks_time = ticks_time.filter(d => d>= limit_low && d<= limit_high);
  
  d3.select('div#time_selection_slider').html(""); //remove all existing slider in the div
  d3.select('p#time_selection_range_number').html("");
  
  // const tick_values = [...Array(12).keys()].map(d=> new Date(1970,d,1));
    //"June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
	var sliderStep = d3
    .sliderBottom()
    .min(d3.min(ticks_time))
    .max(d3.max(ticks_time))
    .width(width)
	.step(1000 * 60 * 60 * 24 * 2)//time step of 31 days
    .ticks(ticks_time.length)
    .tickFormat(d3.timeFormat('%b - %y'))
    .tickValues(ticks_time)
    .default([limit_low, limit_high])
	.fill('#2196f3')
    .on('onchange', val => {
      d3.select('p#time_selection_range_number').text(val.map(d=> d3.timeFormat('%d %B %Y')(d)).join(" - "));
		});

  var gStep = d3
    .select('div#time_selection_slider')
	.attr("class", "time_selection_control")
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(15,10)');

  gStep.call(sliderStep);

  d3.select('p#time_selection_range_number').attr("class", "time_selection_control").text(sliderStep.value().map(d3.timeFormat('%d %B %Y'))
      .join(' - '));
  return sliderStep;
}
function get_value_time_slider(){
	let wrong_format_value = d3.select("p#time_selection_range_number").text().split("-").map(d=>d.trim());
	//['31 March 2020', '01 January 2022']
	return wrong_format_value.map(d=>d3.timeParse("%d %B %Y")(d))
}
function generate_cancel_button(siz){
	const size = String(siz);
	return '<svg width = '+size+' height = '+size+' class="svg_cancel_button"> '+
		'<line x1="0" y1="0" x2='+size+' y2='+size+' stroke="black" stroke-width="2"/>'+
		'<line x1='+size+' y1="0" x2="0" y2=' + size + ' stroke="black" stroke-width="2"/></svg>'
}
function generate_add_button(siz){
	const size = String(siz);
	return '<svg width = '+size+' height = '+size+' class="svg_add_button"> '+
		'<line x1="0" y1=' +size/2+' x2='+size+' y2='+size/2+' stroke="black" stroke-width="2"/>'+
		'<line x1='+size/2+' y1="0" x2='+ size/2+' y2=' + size + ' stroke="black" stroke-width="2"/></svg>'
}

function find_first_defined_action_value(date_and_action){
	var i=0;
	var res = undefined;
	var go_on = true;
	while(go_on && i<date_and_action.length-1){
		if(date_and_action[i]["action"]!=undefined && date_and_action[i]["action"]!=0)
			{
				res = date_and_action[i]["action"]; go_on = false;
			}
		i++;
	}
	return res
}

function variation_of_dataset_from_beginning(dataset)
{
	const clefs = Object.keys(dataset[0]).filter(d=> d!="date");
	const first_values = clefs.reduce(function (acc, cur_val) {
		var i=0;
		var go_on = true;
		while(go_on && i<dataset.length){
			if(dataset[i][cur_val]!=undefined && dataset[i][cur_val]!=null)
				{acc[cur_val] = dataset[i][cur_val]; go_on = false}
			i++;
		}
		
		}, {});
	
	return dataset.map(function (d) {
			var accumulator = {};
			for (const clef of clefs){
				if(d[clef]!=undefined)
				{
					// COMPLETE
				}
			}
			return accumulator
		})
	
}

function transform_into_relativ(dataset_of_datapoints){
	// dataset_of_datapoints = [ {date:?, action: ?}, ...]
	let list_of_first_values = dataset_of_datapoints.map(d=>find_first_defined_action_value(d)) ; 
	return dataset_of_datapoints
			.map((d,number_curve) => {
				const v =list_of_first_values[number_curve]; 
				
				return d.map( dict_ => {
					let res={}; 
					if(dict_["action"] == undefined ) 
						{res.action = undefined} // if data missing (here it means =0)
					else {res.action = (dict_["action"] - v)/v * 100;}
					
					res.date = dict_.date; return res })
				});
}
function replace_0_by_undefined(dataset_of_datapoints){
	// dataset_of_datapoints = [ {date:?, action: ?}, ...]
	return dataset_of_datapoints
			.map((d,number_curve) => 
				 d.map( dict_ =>{
					let res={};
					if(dict_["action"] == 0){res.action = undefined}
					else{res.action = dict_["action"]}
					res.date = dict_["date"];
					return res
					})
				);
}
function transform_in_d_to_d_variation(dataset){
	let resultat= [];
	for (const table of dataset){
		var last_value = undefined;
		
		resultat.push(
			table.slice(1) // ignore first element
				.map(function (d,i){
					let res={};
					res.date = d.date;
					res.action = undefined;
					
					if(table[i].action != undefined && d.action != undefined){
						if(table[i].action != 0 && d.action != 0){ // we consider 0 as undefined
						res.action = (d.action - table[i].action)/table[i].action * 100;
						last_value = d.action;
						}
					}
					else{
						if(table[i].action == undefined && d.action!= undefined){
							res.action = (d.action - last_value)/last_value*100;
							last_value = d.action;
						}
					}
					return res
			})
		)
	}
	return resultat
}

function float_to_string_separate_thousands(number){
	let string_num = String(number);
	let res = string_num[string_num.length -1];
	var i = string_num.length -2;
	while(i>=0){
		if((string_num.length -1-i)%3 == 0){res = " " + res}
		res = string_num[i] + res;
		i--;
	}
	return res
}

/*
		OTHERS
*/


function triangle(coord, size){
  const racine_de_3sur2 = 0.87;
  const racine_de_2sur2 = 0.71;
  const top_point = {x:coord.x, y: coord.y - size};
  const left_point = {x:coord.x - racine_de_2sur2*size, y:coord.y + racine_de_2sur2*size};
  const right_point = {x:coord.x + racine_de_2sur2*size, y:coord.y + racine_de_2sur2*size};
  return [left_point, top_point, right_point].map(d=> [String(Math.round(d.x*10)/10), String(Math.round(d.y*10)/10)].join(",")).join(" ")
}
function inverted_triangle(coord, size){
  const racine_de_3sur2 = 0.87;
  const racine_de_2sur2 = 0.71;
  const top_point = {x:coord.x, y: coord.y + size};
  const left_point = {x:coord.x - racine_de_2sur2*size, y:coord.y - racine_de_2sur2*size};
  const right_point = {x:coord.x + racine_de_2sur2*size, y:coord.y - racine_de_2sur2*size};
  return [left_point, top_point, right_point].map(d=> [String(Math.round(d.x*10)/10), String(Math.round(d.y*10)/10)].join(",")).join(" ")
}

function get_id_selected_countries(){
	let main_selection_country = [];
	// push all the id of selected countries in main_selection_country
	d3.selectAll(".country_selection_block").each(function (d) {main_selection_country.push(d3.select(this).attr("data_id_country"))});
	return main_selection_country
}
function get_alpha3_selected_countries(countries_codes){
	return get_id_selected_countries()
		.map(d=>
						convert_country_identification("country-code", "alpha-3", d, countries_codes)
					// this is the list of name of curves we will have to plot
				);
}
function get_market_name_of_selected_countries(countries_codes){
	let res = get_alpha3_selected_countries(countries_codes)
			.map(d=>get_market_name_from_country_alpha3(d))
	return res
}
function get_selected_special_markets()
{
	let special_markets_selection = [];
	// push all the id of selected countries in main_selection_country
	d3.selectAll(".special_markets_selection_block").each(function (d) {special_markets_selection.push(d3.select(this).attr("data_market_id"))});
	return special_markets_selection
}
async function get_id_name_country_correspondance(){
	let countries_codes = await fetch_data_countries();
	return countries_codes.reduce( function callba(acc,d) {
		acc[d['country-code']] = d.name
	}, {})
}

function get_curve_selection(countries_codes)
{ // you need to handle when there is no selection
	
		let list_of_curves = get_id_selected_countries()
		.map(d=>get_market_name_from_country_alpha3(
						convert_country_identification("country-code", "alpha-3", d, countries_codes)
					)// this is the list of name of curves we will have to plot
				);
		return list_of_curves.concat(get_selected_special_markets());
	
}


function is_main_selection_checkbox_checked(){
	return d3.select("#main_selection_control").property("checked")
}
function special_markets_select() {return Object.assign( {}, {"-- Please select":null},special_markets())} // mergin the two dict
function adding_select_special_markets(){
		let inverse_special_markets = Object.fromEntries(Object.entries(special_markets()).map(x => x.reverse()));
		let special_markets_already_selected = get_selected_special_markets().map(d=>inverse_special_markets[d]);
		let special_markets_not_selected_yet = Object.keys(special_markets_select()).filter(d=>!special_markets_already_selected.includes(d));
			d3.select("#special_markets_dashboard")
			.append("p")
			.attr("class","special_markets_temporary_selection_block")
			.append("select")
			.selectAll("option")
			.data(special_markets_not_selected_yet).enter()
			.append("option")
			.attr("value", d=>special_markets_select()[d])
			.html(d=> d)
		}
function handling_temporary_special_markets_selection(substitute_this, countries_codes, colors){
	let selection_value = d3.select(substitute_this).property("value");
	let inverse_special_markets = Object.fromEntries(Object.entries(special_markets()).map(x => x.reverse()));
	// colors already used
	var list_colors_in_use = get_curve_selection(countries_codes).map(d=>fill_color_of_selection_block(d, countries_codes))	
	if( selection_value != null){
		//delete old value
		d3.select(substitute_this.parentNode).remove()
		/*
		console.log("Selection_value");
		console.log(selection_value);
		console.log(inverse_special_markets[selection_value]); */
		//append a new value
		d3.select("#special_markets_dashboard")
			.append("p")
			.attr("class","special_markets_selection_block")
			.attr("data_market_id", selection_value)
			.style("background-color", 
						// we need to handle the case where there is no selection
						d=> get_curve_selection(countries_codes)== undefined  ?
						colors[0]:
						element_from_l1_not_in_l2(colors.slice(3), list_colors_in_use)  //number of blocks of country selected on the main dashboard
					)
			.html(inverse_special_markets[selection_value] + " "+ generate_cancel_button(10))
		// when user decides to remove the node
		d3.selectAll("#special_markets_dashboard p svg.svg_cancel_button")
			.on("mouseover", function (){d3.select(this).selectAll("line").attr("stroke","grey");})
			.on("mouseout", function (){d3.select(this).selectAll("line").attr("stroke","black");})
			// when user wants to delete selection
			.on("click", function (){
					d3.select(this).node().parentNode.remove();
				});
	}
}
function element_from_l1_not_in_l2(l1, l2){
	var res=undefined;
	l1 = l1.map(d=>d.replace(/\s/g, ""));
	l2 = l2.map(d=>d.replace(/\s/g, ""))
	var go_on= true;
	for (const elem of l1){
		if(go_on && !l2.includes(elem)){
			res=elem;
			go_on = false;
		}
	}
	return res
}

function fill_color_of_selection_block(market_id, countries_codes){
	let fill_color = null;
	
	d3.selectAll("#special_markets_dashboard p")
	.each(function (d) {
		if(d3.select(this).attr("data_market_id") == market_id){
			fill_color = d3.select(this).style("background-color")
			}
		});
		
	d3.selectAll("#country_dashboard p")
	.each(function (d) {
		let current_country_alpha3 = convert_country_identification("country-code", "alpha-3", d3.select(this).attr("data_id_country"), countries_codes);
		let current_market_id = table_market_country()[current_country_alpha3];
		if(current_market_id == market_id){
			fill_color = d3.select(this).style("background-color")
			}
		});
		
	
	return fill_color
}
function select_keys_in_dict(dict,keys)
{
	return keys.reduce(function (filtered, key) {
    if (keys.includes(key)) {filtered[key] = dict[key];}
    return filtered;
}, {});
}

function find_index_of_date_in_liste_dates(liste_dates, date){
	//dates sorted in ascendant order
	var i=-1;
	var go_on = true;
	while (i<liste_dates.length-1 && go_on){
		i++;
		if(date <= liste_dates[i]){
			go_on=false;
		}
	}
	return i;
	
}

function downsize_curve_values(dataset) {
	let dataset_mod = dataset.map(dat => dat.filter(d=>d.action!=undefined));
	let hun_thou_mill = d3.max(dataset_mod.map(great_array=>
			Math.floor(Math.log10(d3.max(great_array.map(d=> {return d.action})))))) 
		
	hun_thou_mill = (Math.floor(hun_thou_mill/3))*3;
  //hun_thou_mill = hundreds, thousands or millions ? 
	dataset_mod = dataset_mod.map(great_array => {
  // we change the numbers to keep them under ... 
	  return great_array.map(d => {	
					var data_point = d;
					data_point.action = d.action*10**(- hun_thou_mill);
					return data_point
				  })
		});
	return {"dataset" : dataset_mod, "hun_thou_mill" : hun_thou_mill}
}


// cursor functions
function mouseover_cursor(ref_svg) {
			ref_svg.select(".cursor_line").style("opacity", 1)
			//focusText.style("opacity",1)
		  }

function mousemove_cursor(x0, ref_svg, r_dataset, x_function, countries_codes_, is_relatif=true) {
	let id_curves = ref_svg.selectAll("path").nodes().map(d=>d["dataset"]["name"]).filter(d=>d!=undefined);
	// recover coordinate we need
	var indexes_we_cannot_plot = []; // if a dataset is empty
	r_dataset.map((d,i)=> {if(d.length ==0){indexes_we_cannot_plot.push(i)}});
	r_dataset = r_dataset.filter(d=>d.length!=0);
	id_curves = id_curves.filter((d,i) => !indexes_we_cannot_plot.includes(i))
	
	
	let ticks_abscisse = r_dataset.map(data=> data.map(d=>d.date));
	//list of indexes for closest data across tables
	var location_for_data = ticks_abscisse.map(d=>find_index_of_date_in_liste_dates(d, x0));
	let selectedData = r_dataset.map((d,i)=>d[location_for_data[i]]);
	
	// rounding up numbers
	selectedData = selectedData.map(d=>{d.action = String(Math.round(d.action * 10)/10); 
				if(is_relatif){d.action = d.action >0 ? ("+" + d.action) : d.action; }
				return d})
	ref_svg.select(".cursor_line")
	  .attr("x1", x_function(x0))
	  .attr("x2", x_function(x0));
	
	  display_values_with_cursor(ref_svg, d3.timeFormat("%d/%m/%y")(x0), x_function(x0), 10, id_curves, selectedData, countries_codes_)
	}
function mouseout_cursor(ref_svg) {
	ref_svg.select(".cursor_line").style("opacity", 0)
	ref_svg.selectAll(".display_cursor_values").remove()
	//focusText.style("opacity", 0)
  }

function display_values_with_cursor(ref_svg, value_x,start_x, start_y, id_curves, values, countries_codes_)
{
	ref_svg.selectAll(".display_cursor_values").remove()
	// create a dict with curve_id as key and color of plot as value
	let starts_y = [];
	let espacement = 20;
	for (let i=0;i<id_curves.length;i++){starts_y.push(start_y+ (i+1)*espacement)}
	var color_of_plot = ref_svg.selectAll("path").nodes().map(d=> d["attributes"][2]["nodeValue"]).slice(0,id_curves.length);
	//id_curves.map(d=>color_of_plot.push(fill_color_of_selection_block(d, countries_codes_)));
	var legend = [];
	id_curves.map(d=>legend.push(market_index_to_name(d)));
	legend = legend.map((d,i)=> {if(d==undefined){return id_curves[i]}
						else {return d} });
	
	
	
	//displaying Y values
	var Bboxes = [];
	ref_svg
	.append('g')
	.attr("class", "display_cursor_values")
	.selectAll("text").data(id_curves).enter()
	.append('text')
	  .attr("text-anchor", "left")
	  .attr("alignment-baseline", "middle")
	  .attr("x", start_x)
	  .attr("y", (d,i)=> starts_y[i]) 
	  .html((d,i) =>legend[i]+ " : " + values[i].action)
	// collecting the Bboxes 
	.each(function (d) {Bboxes.push(d3.select(this).node().getBBox())});
	
	
	 // displaying X
	 ref_svg.selectAll(".display_cursor_values").append("text")
		.attr("text-anchor", "left").attr("alignment-baseline", "middle")
	  .attr("x", start_x)
	  .attr("y", start_y) 
	  .html("x: " + value_x)
	  // collecting the Bboxes 
	.each(function (d) {Bboxes.push(d3.select(this).node().getBBox())});
	  
	 //display rect
	 ref_svg.selectAll(".display_cursor_values")
	 .selectAll("rect").data(id_curves).enter().append("rect")
	 .attr("x", (d,i)=> Bboxes[i].x)
	 .attr("y", (d,i)=> Bboxes[i].y)
	 .attr("width", (d,i)=> Bboxes[i].width)
	 .attr("height", (d,i)=> Bboxes[i].height)
	 .attr("fill", (d,i)=> color_of_plot[i])
	 .attr("opacity", 0.3)
}
function plot_line(div_selection, width, height, dataset, list_of_curves,coloration,n_curve, axisTitle = { "x": null, "y":null}){
	  //gathering the values select by the elements with "first_select" as class name
		
		div_selection.html('');
		console.log("Executing plot_line for curve " + String(n_curve) +" : hereafter is dataset")
		console.log(dataset)
		console.log(list_of_curves)
		console.log(coloration)
		
		
	  	const top_margin = 20 ;//+ list_of_curves.length * 7;//leaving space for the legend
		const margin = ({top: top_margin, right: 30, bottom: 30, left: 40})
		
	  
	  
	  const svg = div_selection.append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("border", "solid")
		.style("border-width", "2px");
	  
	  const x = d3.scaleTime()
	  .domain(d3.extent(dataset[0], function(d) { 
		return new Date(d.date); 
	  }))
	  .range([margin.left, width - margin.right]);
	  
	  const y = d3.scaleLinear()
		.domain([d3.max(dataset.map(d=> d3.max(d.map(e=>{return e.action})))), 
				 min_(dataset.map(d=> min_(d.map(e=>{return e.action}))))]) 
				.range([margin.top, height - margin.bottom]);
	  
	const x_step = (width - margin.right - margin.left)/dataset.length // step for (**)
	
	let line = d3.line()
		.y(d =>  y(d.action) - margin.top)
	  .defined(d => { return d.action }) // enables to not take null values into account
	  .x((d, i) => x(d.date) - margin.left ) // (**)
	  

	  svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`).selectAll("path")
		.data(dataset)
		.enter()
		.append("path")
		.attr("d", d => line(d))
		.attr("fill", "none")
		.attr("stroke", (d,i) => coloration[i])
		.attr("data-name", (d,i)=>list_of_curves[i])
		.attr("stroke-width",2)
		.on( "mouseover",mouseover).on("mouseout", mouseout) //plot the legend  {"text": "BABA", "id" : "legend", "color":"black"}

	//creation of the axis
	
	const time_limits = d3.extent(dataset[0], d => new Date(d.date));
	
	
	const timespan = time_limits[1].getTime() - time_limits[0].getTime();
	const unjour = 24*3600*1000;
	const un_an_et_demi = unjour * (365 + 365/2);
	const six_mois = unjour * (365/2);
	let xAxis = undefined;
	let un_an_ou_six_mois = parseInt((timespan/un_an_et_demi <1) + (timespan/six_mois <1));
	switch(un_an_ou_six_mois){
		case 2: //inférieur à 6mois
		xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d-%b-%y")).ticks(8)) 
		break;
		case 1: // inférieur à 1 an et demi
		xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b-%y")).ticks(8)) 
		break;
		case 0:// supérieur à un an et demi
		xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b-%Y")).ticks(6)) 
		break;
	}

	let yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y))

	  svg.append("g")
		  .call(xAxis);

	  svg.append("g")
		  .call(yAxis);
	// add title on axis
	if(axisTitle["x"]!=null){
		svg.append("g").append("text")
		.attr("text-anchor", "middle")
		.attr("class", "title_x")
		.attr("x", width/2 )
		.attr("y", (height - 5))
		.text(axisTitle["x"])
	}
	if(axisTitle["y"]!=null){
		svg.append("g").append("text")
		.attr("class", "title_y")
		.attr("text-anchor", "middle")
		.attr("x", -height/2)
		.attr("y", 13)
		.attr("transform", "rotate(-90)")
		.text(axisTitle["y"])
		
	}
	
	// implementation of the cursor 
			svg
			.append('g')
			.append('line')
			.attr("class", "cursor_line")
			.style("fill", "none")
			.attr("stroke", "black")
			.attr("y1", 0).attr("y2", height - margin.bottom)
			.style("opacity", 0)

			// Create a rect on top of the svg area: this rectangle recovers mouse position
		  svg
			.append('rect')
			.style("fill", "none")
			.style("pointer-events", "all")
			.attr("data_id_curve", n_curve)
			.attr("class", "rect_for_cursor")
			.attr('width', width)
			.attr('height', height);
			
		  // What happens when the mouse move -> show the annotations at the right positions.
		  
			  
	  return {"svg_node" : svg.node() , "dataset" : dataset, "x": x}
}