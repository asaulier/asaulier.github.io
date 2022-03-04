const table_market = {"tse":"Tokyo", "sse":"Shangai", "euronext": "Euronext", 
		"nasdaq":"Nasdaq", "nyse":"New York", "None":"None"
		};

function table_market_country(){
	return {"USA" : "nyse", "JPN" : "tse", "CHN" : "sse"}
			//"FRA" : "cac40", "DEU":"dax", "GBR":"ftse"}
}
function special_markets(){
	return {"Euronext" : "euronext", "Nasdaq":"nasdaq"}
}
function write_data_type_selection_options(){
	const data_type_selection_options = {
		"price" : "Stockmarket index", 
		"volume" : "Stockmarket volume",
		"covid" : "COVID cases", 
		"commodities" : "Commodities", 
		"gdp":"GDP"
	};
	// inverting the dictionnary
	const reverse_data_type_selection_options = Object.fromEntries(Object.entries(data_type_selection_options).map(x => x.reverse()));
	d3.selectAll(".data_type_selection").selectAll("option")
	.data(Object.values(data_type_selection_options))
	.enter()
	.append("option")
	.html(d=>d)
	.attr("value", d => reverse_data_type_selection_options[d])
}
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
/* 
		FETCH FUNCTIONS
*/
async function fetch_raw() {
  return d3.csv("https://raw.githubusercontent.com/asaulier/dataviz_project/main/first_collection_export.csv", d => {
  let price = {}
  let volume = {}
  price.tse = +d.topix_open
  price.euronext =+d.euro_open
  price.nyse = +d.sp500_open
  price.nasdaq = +d.nasdaq_open
  price.sse = +d.sse_open //shangai
  volume.tse = +d.topix_volume
  volume.euronext = +d.euro_volume
  volume.nyse = +d.sp500_volume
  volume.nasdaq = +d.nasdaq_volume
  volume.sse = +d.sse_volume
  let date = d3.timeParse("%d/%m/%Y")(d.date)
  return {"date": date, "price":price, "volume":volume}
})}
async function fetch_data_world(){return d3.json("https://unpkg.com/world-atlas@1/world/50m.json")}
async function fetch_data_countries() {return d3.csv("https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv")}
async function fetch_covid(){return d3.csv("https://raw.githubusercontent.com/asaulier/dataviz_project/main/covid-data_reduced.csv", sep=";")}
async function fetch_interest_rates(){return d3.csv("https://raw.githubusercontent.com/asaulier/dataviz_project/main/interest_rates.csv")}
async function fetch_bitcoin(){return d3.csv("https://raw.githubusercontent.com/asaulier/dataviz_project/main/bitcoin_investing.csv")}
async function fetch_commodities(){return  d3.csv("https://raw.githubusercontent.com/asaulier/dataviz_project/main/commodity%20prices_base_2016.csv")}
async function fetch_liste_dates(){
	//renvoie un array de dates rangées dans l'ordre croissant
	return d3.csv("https://raw.githubusercontent.com/asaulier/dataviz_project/main/liste_date.csv",d=>d3.timeParse("%d/%m/%Y")(d.date))
	}


function fill_missing_dates(dataset, liste_dates)
{
	const clefs = Object.keys(dataset[0]).filter(d=> d!="date");
	const dict_donnee_vide = clefs.reduce( function a(acc,cur_val){
									acc[cur_val] = undefined;
									return acc
								},{});
	var res = [];
	var i = 0;
	var j = 0;
	while (i<liste_dates.length){
		if(dataset[j]["date"].getTime()==liste_dates[i].getTime()){
			res.push(dataset[i])
			if(j<dataset.length - 1){j++;}
		}
		else{
			if(dataset[j]["date"]<liste_dates[i]){
				while(dataset[j]["date"]<liste_dates[i] && j<dataset.length)
					{		j++;	}
				}
			res.push(Object.assign( {}, {'date' : liste_dates[i]}, dict_donnee_vide));
		}
		i++;
	}
	return res
}
function variation_of_dataset(dataset)
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

/*
		OTHERS
*/

function market_index_to_name(string_){
	return table_market[string_]
}
function market_name_to_index(string_){
	//inverting the table_market dictionnary
	const tt = Object.fromEntries(Object.entries(table_market).map(x => x.reverse()));
	return tt[string_]
}
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
		.map(d=>get_market_name_from_country_alpha3(
						convert_country_identification("country-code", "alpha-3", d, countries_codes)
					)// this is the list of name of curves we will have to plot
				);
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

async function fetch_and_convert_country_identification(initial_format, final_format, value){
	// takes a value of identification based on an initial format and turns it to another
	let countries_codes = await fetch_data_countries();
	let res = countries_codes.filter(d=> d[initial_format] == value)
	return res[0][final_format]
}
function convert_country_identification(initial_format, final_format, value, countries_codes){
	// takes a value of identification based on an initial format and turns it to another
	let res = countries_codes.filter(d=> d[initial_format] == value)
	if(res[0] == undefined){return null}
	else{return res[0][final_format]}
}

function get_market_name_from_country_alpha3(country_alpha3){
	return table_market_country()[country_alpha3]
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
	if( selection_value != null){
		//delete old value
		d3.select(substitute_this.parentNode).remove()
		
		//append a new value
		d3.select("#special_markets_dashboard")
			.append("p")
			.attr("class","special_markets_selection_block")
			.attr("data_market_id", selection_value)
			.style("background-color", 
						// we need to handle the case where there is no selection
						d=> get_curve_selection(countries_codes)== undefined  ?
						colors[0]:
						colors[get_curve_selection(countries_codes).length + 1] //number of blocks of country selected on the main dashboard
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
// WRITINGGGGGG
