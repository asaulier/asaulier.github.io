async function main(){
	//importing data
	let countries_codes = await fetch_data_countries(); // list of countries' info and codes
	let world = await fetch_data_world();
	let raw = await fetch_raw();
	let liste_dates = await fetch_liste_dates();
	let bitcoin = await fetch_bitcoin();
	let commodities = await fetch_commodities();
	let interest_rates = await fetch_interest_rates();
	//let covid = await fetch_covid();
	
	let raw_volume= raw.map(function nimportequoi(d){
	  return Object.assign( {}, d.volume, {"date":d.date}) //merge the two dictionnaries
	});
	
	const colors = ["black", "blue", "red", "#800000", "#FFA500", "#DAA520", "#FFD700", "#7CFC00", "#00FFFF", "#9400D3", "#FF1493", "#C0C0C0"];


	
	write_data_type_selection_options();
	let time_slider = great_time_range(1200);
	
	//because of the map, we got to make sure that the div width is large enough
	//so there is no overlap
	
	d3.select(d3.select("#map").node().parentNode)
	.style("padding-right", "5px")
	.style("width", 800);
	
	main_map(countries_codes, world, colors, w=800,h=300);
	main_dashboard(countries_codes, colors);
	
	d3.select("#country_dashboard").on("DOMSubtreeModified",refresh_plots);
	d3.select("#special_markets_dashboard").on("DOMSubtreeModified",refresh_plots);
	time_slider.on("onchange", function une_fonction(val){
		d3.select('p#time_selection_range_number').text(val.map(d=> d3.timeFormat('%d %B %Y')(d)).join(" - "));
		refresh_plots();
		
		});
	
	d3.selectAll(".curve_control").on("change", refresh_plots);
	
	const clefs = Object.keys(raw_volume[0]).filter(d=> d!="date");
	
	console.log(raw_volume.map(function l(d){
				const term_raw = d;
				var res = {};
				// on transforme l'array en assignant la date comme la clef
				res[d["date"].getTime()] = clefs.map(e=>term_raw[e]);
				return res					
				}))
	//console.log({raw_volume[0]["date"].getTime() : 0})
	/*console.log(clefs.reduce( function callback_(acc,cur_val){
											acc[cur_val] = cur_val;	
											return acc
									},{})) */
	console.log(fill_missing_dates(raw_volume,liste_dates))
	console.log(raw_volume.slice(0,10).map(d=>d.date))
	console.log(liste_dates.slice(0,10))
	console.log(raw_volume[0].date > liste_dates[1])
	
	
	//console.log(liste_dates)
	
	
	function refresh_plots(){
		main_curve1(countries_codes, raw, 700,250); 
		main_curve2(countries_codes, raw,650,250);
		//main_curve3(countries_codes, covid, 450, 250);
	}
}