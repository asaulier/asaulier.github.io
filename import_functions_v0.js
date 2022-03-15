const table_market_bis = {
		"topix":"Tokyo", "sse_composite":"Shanghai", "euronext": "Euronext", 
		"nasdaq_composite":"Nasdaq", "nyse_composite":"New York", 
		"nifty_50": "New Delhi", "s&p_tsx":"Toronto", 
		"msci_korea":"Seoul", "moex_russia":"Moscow",
		"dax":"Berlin", "cac40":"Paris", "ibovespa": "Sao Paolo",
		"None":"None"
		};
		
const table_market = {
		"topix":"Japan", "sse_composite":"China", "euronext": "Euronext", 
		"nasdaq_composite":"Nasdaq", "nyse_composite":"USA", 
		"nifty_50": "India", "s&p_tsx":"Canada", 
		"msci_korea":"South Korea", "moex_russia":"Russia",
		"dax":"Germany", "cac40":"France", "ibovespa": "Brazil",
		"bitcoin": "Bitcoin", "vix": "VIX",
		"None":"None"
		};

function path_to_file_collection_markets(){return "https://raw.githubusercontent.com/asaulier/asaulier.github.io/main/imports/markets/"}

function file_names_with_country_s_alpha3(){
	return {
		"bitcoin" : null,
		"cac40" : "FRA",
		"dax": "DEU",
		"euronext":null,
		"hangseng" : "HKG",
		"ibovespa" : "BRA",
		"moex_russia" : "RUS",
		"msci_korea" : "KOR",
		"nasdaq_composite" : null,
		"nifty_50" : "IND",
		"nyse_composite" : "USA",
		"s&p_tsx" : "CAN",
		"sse_composite" : "CHN",
		"topix" : "JPN",
		"vix":null,
	}
}
		
async function import_market_file(market_name){
	return d3.csv(path_to_file_collection_markets() + market_name + ".csv" , d=> 
	{
		let res={};
		const keys_dict =Object.keys(d).filter(e=>e!="date");
		res.date = d3.timeParse("%Y-%m-%d")(d.date);
		return Object.assign( {}, res, d3.autoType(select_keys_in_dict(d,keys_dict)))
	})
}
async function import_all_market_files()
{
	let file_names = Object.keys(file_names_with_country_s_alpha3());
	let res = {};
	for (const file_name of file_names){
		res[file_name] = await import_market_file(file_name);
	}
	return res
}
function table_market_country(){
	let file_names = file_names_with_country_s_alpha3();
	let clefs = Object.keys(file_names);
	clefs = clefs.filter(d=> file_names[d]!=null);
	let res = {};
	clefs.map(d=> res[file_names[d]] = d)
	return res
}
function special_markets(){
	return {"Bitcoin" : "bitcoin","Euronext" : "euronext", "Nasdaq":"nasdaq_composite", "VIX" : "vix"}
}

function write_data_type_selection_options(){
	const data_type_selection_options = {
		"none": "-- Choose a topic",
		"stockmarket" : "Stockmarket", 
		"covid" : "COVID cases", 
		"commodities" : "Commodities", 
		"fx_rates" : "Foreign Exchange",
		"interest_rates": "Central Bank rates",
		"cpi_index" : "Consumer Prices"
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


function includes_time(array_, timestamp){
	var res= false;
	let comparaison = timestamp.getTime();
	var i=0;
	while(!res && i<array_.length)
	{
		if(array_[i].getTime() == comparaison){res=true;}
		i++;
	}
	return res
}

function flip_database_time(database, champ_index, champ_key_dict, champ_value_dict){
	let result = [];
	// get all possible index value
	let all_value_index = [];
	database.map(d=> { if(!includes_time(all_value_index,d[champ_index])){all_value_index.push(d[champ_index])} });
	let variable_database = database;
	console.log(all_value_index)
		
	// we fill the result one by one
	for (const index of all_value_index){
		let red_dataset = variable_database.filter(d=>d[champ_index].getTime() == index.getTime())
		let res = {};
		res[champ_index] = index;
		for(let i=0; i<red_dataset.length; i++){
			let datapoint = red_dataset[i];
			res[datapoint[champ_key_dict]] = datapoint[champ_value_dict];
		}
		result.push(res)
		variable_database = variable_database.filter(d=>d[champ_index].getTime() != index.getTime())
	}
	return result
}
/* 
		FETCH FUNCTIONS
*/

async function fetch_raw() {
  return d3.csv("https://raw.githubusercontent.com/asaulier/asaulier.github.io/main/first_collection_export.csv", d => {
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
async function fetch_covid_raw(){return d3.dsv(";","https://raw.githubusercontent.com/asaulier/asaulier.github.io/main/imports/covid-data_reduced.csv")}
async function fetch_covid(){
	let covid_raw= await fetch_covid_raw();
	return covid_raw.map(function (d){
			let res ={};
			const keys_dict =Object.keys(d).filter(e=>e!="date");
			res["date"]=d3.timeParse("%d/%m/%Y")(d.date)
			return Object.assign( {}, res, d3.autoType(select_keys_in_dict(d,keys_dict)))
			//autoType returns a dict but with type infered
			});
}
async function fetch_liste_dates(){
	//renvoie un array de dates rangées dans l'ordre croissant
	return d3.csv("https://raw.githubusercontent.com/asaulier/asaulier.github.io/main/imports/liste_date.csv",d=>d3.timeParse("%d/%m/%Y")(d.date))
	}

async function fetch_fx_codes(){return d3.dsv(";","https://raw.githubusercontent.com/asaulier/asaulier.github.io/main/imports/currency_codes.csv")}
async function fetch_fx_rates(){return d3.dsv(";","https://raw.githubusercontent.com/asaulier/asaulier.github.io/main/imports/fx_rates.csv")}
	
async function fetch_commodity_prices(){return d3.dsv(";", "https://raw.githubusercontent.com/asaulier/asaulier.github.io/main/imports/commodity%20prices_base_2016.csv")}	
async function fetch_commodity_correspondance(){return d3.dsv(";", "https://raw.githubusercontent.com/asaulier/asaulier.github.io/main/imports/correspondance_titre_commodity.csv")}

async function fetch_interest_rates(){return d3.dsv(";", "https://raw.githubusercontent.com/asaulier/asaulier.github.io/main/imports/interest_rates.csv")}

async function fetch_cpi_index(){return d3.dsv(";", "https://raw.githubusercontent.com/asaulier/asaulier.github.io/main/imports/consumer_price_indexes.csv")}

function autoParse(database, date_format){
	return database.map(function (d){
			let res ={};
			const keys_dict =Object.keys(d).filter(e=>e!="date");
			res["date"]=d3.timeParse(date_format)(d.date)
			return Object.assign( {}, res, d3.autoType(select_keys_in_dict(d,keys_dict)))
			//autoType returns a dict but with type infered
			});
}
function parse_cpi_index(cpi_index, countries_codes){
	console.log("Executing parse_cpi_index")
	let clefs = Object.keys(cpi_index[0]).filter(d=>d!="date");
	let clefs_split = clefs.map(d=>d.split("__"));
	let name_countries = [...new Set(clefs_split.map(d=>d[0]))];
	let alpha3_countries = name_countries.map(d=>{
			let res = convert_country_identification("name", "alpha-3", d, countries_codes);
			if(res==undefined){
				switch (d){
					case "United Kingdom" : res = "GBR";break;
					case "United States" : res = "USA";break;
				}
			}
			return res
		})
	
	let cpi_dataset = {};
	for(let i =0; i< name_countries.length; i++){
		let pays = alpha3_countries[i];
		if(pays!=undefined){
			let res= []; //whole dataset for one country
			let second_keys_of_country = clefs_split.filter((d)=>name_countries[i]==d[0]).map(d=>d[1]);
			let keys_in_initial_dataset = clefs_split.map((d,j)=>{if(d[0]==name_countries[i]){return clefs[j]}}).filter(d=>d!=undefined);
			console.log(pays)
			console.log(second_keys_of_country)
			console.log(keys_in_initial_dataset)
			for(const line of cpi_index){
				let r = {};
				r.date = d3.timeParse("%d/%m/%Y")(line.date)
				for (let j =0; j< second_keys_of_country.length; j++){
					r[second_keys_of_country[j]] = parseFloat(line[keys_in_initial_dataset[j]]);
				}
				res.push(r)
			}
			cpi_dataset[pays] = res;
		}
	}
	console.log(cpi_dataset)
	return cpi_dataset
	
}
	
function fill_missing_dates(dataset, liste_dates)
{ // dataset = [ {date: ?, euronext:?, sse: ?}, ... ]
	const clefs = Object.keys(dataset[0]).filter(d=> d!="date");
	const dict_donnee_vide = clefs.reduce( function a(acc,cur_val){
									acc[cur_val] = undefined;
									return acc
								},{});
	let res = [];
	var i =0;
	var j = 0;
	while (i<liste_dates.length){
		if(dataset[j]["date"].getTime()==liste_dates[i].getTime()){
			res.push(dataset[j])
			if(j<dataset.length - 1){j++;}
		}
		else{
			if(dataset[j]["date"]<liste_dates[i]){
				while(dataset[j]["date"]<liste_dates[i] && j<dataset.length-1)
					{		j++;	}
				}
			res.push(Object.assign( {}, {'date' : liste_dates[i]}, dict_donnee_vide));
		}
		i++;
	}
	return res
}

function market_index_to_name(string_){
	return table_market[string_]
}
function market_name_to_index(string_){
	//inverting the table_market dictionnary
	const tt = Object.fromEntries(Object.entries(table_market).map(x => x.reverse()));
	return tt[string_]
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

function get_div_dimension_based_on_window_size(){
	var viewport_height = document.documentElement.clientHeight;
	var viewport_width = document.documentElement.clientWidth;
	viewport_height -= d3.select("#main_dashboard").node().clientHeight;
	let result = {}; // width and height of curve number (goes from 0 to 4 for map)
	result["width"] = Math.floor(viewport_width/2);
	result["height"] = Math.floor(viewport_height/2);
	return result
}

function get_div_dimension(identifier){
	let each_div_size = get_div_dimension_based_on_window_size();
	d3.select("#" + identifier).style("width", each_div_size["width"]);
	let control_curve_height = d3.select("#"+identifier + " div").node().clientHeight;
	let width = Math.floor(each_div_size["width"]*0.95);
	let height = Math.floor( (each_div_size["height"] -  control_curve_height)*0.95);
	return {"width" : width, "height" : height}
}

