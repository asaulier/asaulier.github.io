async function main(){
	//importing data
	let countries_codes = await fetch_data_countries(); // list of countries' info and codes
	let world = await fetch_data_world();
	let raw = await import_all_market_files();
	let liste_dates = await fetch_liste_dates();
	let covid = await fetch_covid();
	let fx_codes = await fetch_fx_codes();
	let fx_rates = autoParse(await fetch_fx_rates(),"%d/%m/%Y");
	let commodities_correspondance = await fetch_commodity_correspondance();
	let commodities = autoParse(await fetch_commodity_prices(),"%d/%m/%Y");
	let interest_rates = autoParse(await fetch_interest_rates(), "%d/%m/%Y");
	let cpi_index = parse_cpi_index(await fetch_cpi_index(),countries_codes);
	interest_rates = flip_database_time(interest_rates, "date", "pays", "value");
	
	// complete the dates
	for (const name_curve of Object.keys(raw)){
		 raw[name_curve] = fill_missing_dates(raw[name_curve], liste_dates);
	}
	const colors = ["rgb(0,0,0)", "rgb(200,173,127)", "rgb(0,0,255)", "rgb(255,0,0)", "rgb(128, 0, 0)", "rgb(255, 165, 0)", "rgb(255, 215, 0)", "rgb(124, 252, 0)", "rgb(0, 255, 255)", "rgb(148, 0, 211)"];
	main_dashboard(countries_codes, colors);
	let time_slider = great_time_range(1200);
	
	//because of the map, we got to make sure that the div width is large enough
	//so there is no overlap
	
	main_map(countries_codes, world, colors);
	
	let curve_functions = {1 : main_curve1, 2: main_curve2, 3:main_curve3};
	
	let return_from_curves = [[], [], []];
	
	write_data_type_selection_options();
	
	for (const div_name of [1,2,3]){
		d3.select("#div_curve_" + String(div_name) + " select.data_type_selection")
		.on("change", function () {
			let do_we_plot = true;
			if(!has_data_type_changed(div_name)){
				do_we_plot = has_a_data_type_been_selected(div_name);
			}
			else{do_we_plot = handle_datatype_selection(div_name);}
			if(do_we_plot){
				refresh_plot(div_name);
			}
				d3.selectAll("#div_curve_" + String(div_name) + " select.curve_control")
				.on("change", function (){refresh_plot(div_name)});
		
		}); 
	}
	
	
	d3.select("#country_dashboard").on("DOMSubtreeModified",refresh_plots);
	d3.select("#special_markets_dashboard").on("DOMSubtreeModified",refresh_plots);
	time_slider.on("onchange", function une_fonction(val){
		d3.select('p#time_selection_range_number').text(val.map(d=> d3.timeFormat('%d %B %Y')(d)).join(" - "));
		refresh_plots();
		});
	
	//d3.selectAll(".curve_control").on("change", refresh_plots);
	
	
	function refresh_plots(){
		console.log("Executing refresh_plots for all plots")
		// {"dataset" : ?, "list_of_curves":?, "coloration":? }
		for (const number_curve of [1,2,3]){
			let do_we_plot = true;
			if(!has_data_type_changed(number_curve)){
				do_we_plot = has_a_data_type_been_selected(number_curve);
			}
			else{do_we_plot = handle_datatype_selection(number_curve);}
			if(do_we_plot){
				let dataset_list_color = handle_database_selection(number_curve);
				return_from_curves[number_curve-1] = 
						curve_functions[number_curve](countries_codes, 
						dataset_list_color["dataset"], 
						dataset_list_color["list_of_curves"], 
						dataset_list_color["coloration"]);
			}
		}
		
		for (const number_curve of [1,2,3]){
			
			d3.selectAll("#div_curve_" + String(number_curve) +" .rect_for_cursor")
				.on('mouseover', function (){ for (const curve of return_from_curves){
						mouseover_cursor(d3.select(curve.svg_node))
					}})
				.on('mousemove', function (evenement){
					let curve_hovered = parseInt(d3.select(this).attr("data_id_curve"));
					const x0 = return_from_curves[number_curve-1].x.invert(d3.pointer(evenement)[0]);
					for (const curve of return_from_curves){
						mousemove_cursor(x0,d3.select(curve.svg_node),curve.dataset, curve["x"], countries_codes)
					}})
				.on('mouseout', e=> {
					for (const curve of return_from_curves){
						mouseout_cursor(d3.select(curve.svg_node))
					}})
			
						
		}
	}
	function refresh_plot(number_curve){
		let do_we_plot = has_a_data_type_been_selected(number_curve);
		console.log("Executing refresh_plot for " + String(number_curve))
		if(do_we_plot){
			console.log("Refreshing " + String(number_curve) + " curve")
			let dataset_list_color = handle_database_selection(number_curve);
			// we plot the curve
		console.log(dataset_list_color["dataset"])
			return_from_curves[number_curve-1] = 
						curve_functions[number_curve](countries_codes, 
						dataset_list_color["dataset"], 
						dataset_list_color["list_of_curves"], 
						dataset_list_color["coloration"]);
			// we set the cursors
			d3.selectAll("#div_curve_" + String(number_curve) +" .rect_for_cursor")
					.on('mouseover', function (){ for (const curve of return_from_curves){
							mouseover_cursor(d3.select(curve.svg_node))
						}})
					.on('mousemove', function (evenement){
						let curve_hovered = parseInt(d3.select(this).attr("data_id_curve"));
						const x0 = return_from_curves[number_curve-1].x.invert(d3.pointer(evenement)[0]);
						for (const curve of return_from_curves){
							mousemove_cursor(x0,d3.select(curve.svg_node),curve.dataset, curve["x"], countries_codes)
						}})
					.on('mouseout', e=> {
						for (const curve of return_from_curves){
							mouseout_cursor(d3.select(curve.svg_node))
						}})
		}
	}
	
	
	function handle_database_selection(number_curve){
		// we don't handle the relative and absolute part here
		console.log("Executing handle_database_selection for curve number " + String(number_curve))
		
		let paragraph = d3.select("#div_curve_"+String(number_curve) + " p.paragraph_curve_selection");
		let data_selection = paragraph.selectAll("select.data_selection").nodes().map(d=>d.value);
		let data_type = paragraph.attr("data_type_selection");
		let resultat = undefined; 
		let country_selected = get_alpha3_selected_countries(countries_codes);
		let list_of_curves = undefined;
		let coloration = undefined;
		// returning the result
		console.log("In database_selection, the data_type " + String(data_type))
		console.log(data_selection)
		switch(data_type){
			case "none":
			break;
			case "stockmarket":
				
				list_of_curves = get_curve_selection(countries_codes);
				coloration = list_of_curves.map(d=>fill_color_of_selection_block(d, countries_codes));
	
				resultat = country_selected
					.map(d=>raw[find_key(file_names_with_country_s_alpha3(), d)]);
		
				resultat = resultat.concat(get_selected_special_markets().map(market =>{
					let res = raw[market];
					return res
					}));
				console.log("The sub-data_type " + String(data_selection[0]))
				switch(data_selection[0]){
					case "open":
						resultat = resultat.map(raw_market => {
								let res = raw_market.map(d=> {return {"action" :d["open"], 'date':d["date"]}})
							return res });
					break;
					case "close":
						resultat = resultat.map(raw_market => {
								let res = raw_market.map(d=> {return {"action" :d["close"], 'date':d["date"]}})
							return res });
					break;
					case "volume":
						resultat = resultat.map(raw_market => {
								let res = raw_market.map(d=> {return {"action" :d["volume"], 'date':d["date"]}})
							return res });
					break;
					case "close-open":
						resultat = resultat.map(raw_market => {
							let res = raw_market.map(d=> {
								let action = undefined;
								if(d["open"] == null || d["close"] == null){action=0}
								else{action = (d["close"] - d["open"])/d["open"] *100;}
								return {"action" :action, 'date':d["date"]}
								})
							return res });
					break;
					case "volatility":
						resultat = resultat.map(raw_market => {
							let res = raw_market.map(d=> {
								let action = undefined;
								if(d["high"] == null || d["low"] == null){action=null}
								else{action = (d["high"] - d["low"])/d["low"] *100;}
								return {"action" :action, 'date':d["date"]}
								})
							return res });
					break;
					}
			break;
			
			
			
			case "covid":
				list_of_curves = get_market_name_of_selected_countries(countries_codes);
				coloration = list_of_curves.map(d=>fill_color_of_selection_block(d, countries_codes));
	
				const type_of_curve = data_selection[0];
				
				let list_c = get_curve_selection(countries_codes);
				let list_of_curves_alpha3 = list_c.map(d=>file_names_with_country_s_alpha3()[d]).filter(d=>d!=undefined);
				resultat = [];
				for (const name_curve of list_of_curves_alpha3){
						resultat.push( 
							covid.filter(d=>d["iso_code"]==name_curve)
							.map(d=>{return {"date" : d.date, "action" : d[type_of_curve]}})
							)
					}
			break;
			
			case "commodities":
				list_of_curves = data_selection;
				coloration = colors.slice(0,list_of_curves.selection);
				console.log("COMMMOOOODIIITIEII")
				console.log(coloration)
				resultat = [];
				for (const curve_name of data_selection){
					resultat.push(commodities.map(d=> {return {"date":d["date"] , "action" : d[curve_name]}}))
				}
				break;
				
			case "fx_rates":
				
			// fx_rates test
				let alpha2_country_selection = country_selected.map(d=>convert_country_identification("alpha-3", "alpha-2", d, countries_codes));
				// name of currencies that we have to select
				let fx_rates_selection_dict = alpha2_country_selection.reduce( function (acc, cur_val) {
						let market_name = get_market_name_from_country_alpha3(convert_country_identification("alpha-2", "alpha-3", cur_val, countries_codes))
						acc[fx_codes.filter(e=>e["alpha2"] == cur_val)[0]["currency_code"]] = market_name;
						return acc
					}, {} );
				
				resultat = Object.keys(fx_rates_selection_dict).map(selection => fx_rates.map(d=>{
							return {"date":d.date, "action": d[selection]}
						})
					)
				list_of_curves = Object.values(fx_rates_selection_dict);
				coloration = list_of_curves.map(d=>fill_color_of_selection_block(d, countries_codes));
	
				break;
				
			case "interest_rates":
				list_of_curves = country_selected.map(d=>get_market_name_from_country_alpha3(d));
				coloration = list_of_curves.map(d=>fill_color_of_selection_block(d, countries_codes));
				
				resultat = country_selected.map(selection => interest_rates.map(d=>{
							return {"date":d.date, "action": d[selection]}
						})
					)
				break;
			case "cpi_index":
				const type_curve = data_selection[0];
				list_of_curves = get_market_name_of_selected_countries(countries_codes);
				coloration = list_of_curves.map(d=>fill_color_of_selection_block(d, countries_codes));
				resultat = country_selected.map(selection => {
							if(cpi_index[selection]!=null){
								return cpi_index[selection].map(d=>{
									return {"date":d.date, "action": d[type_curve]}})
							}
							else{
								
								return []
							}
				});
				
				break;
		}
		//filtering out null or void values from dataset
		let true_resultat = [];
		let true_list_of_curves = [];
		let true_coloration = [];
		
		for (let i=0;i<resultat.length; i++){
			if(resultat[i] != [] && resultat[i] != null){
				true_resultat.push(resultat[i]);
				true_list_of_curves.push(list_of_curves[i]);
				true_coloration.push(coloration[i])
			}
		}
		
		return {"dataset" : true_resultat, "list_of_curves" : true_list_of_curves, "coloration" : true_coloration}
	}
	
	function handle_datatype_selection(number_curve){
		let paragraph = d3.select("#div_curve_"+String(number_curve) + " p.paragraph_curve_selection");
		let res = false;
		console.log("Executing handle_datatype_selection for "+ String(number_curve)  +", hereafter is the data_type_selection node ")
		console.log(paragraph.select("select.data_type_selection").node())
			let data_type = paragraph.select("select.data_type_selection").node().value;
			paragraph.selectAll(".curve_control").remove();
			let options = [];
			res = true; // to see if we can after execute handle_database_selection
			switch(data_type){
				case "none":
					res= false;
					break;
				case "stockmarket":
					options = {"open" : "Open Price", "close" : "Close Price", "volume": "Volume", "close-open": "Close-open", "volatility" : "Intraday Volatility"};
					options = Array(options);
					break;
				case "covid":
					options = Object.keys(covid[0]).filter(d=>(d!= "date" && d!= "iso_code"));
					options = options.reduce(function (acc, cur_val){
						acc[cur_val] = cur_val;
						return acc
						} , {})
					options = Array(options);
					break;
				case "commodities":
					options = Object.keys(commodities[0]).filter(d=>(d!= "date"));
					options = options.reduce(function (acc, cur_val){
						acc[cur_val] = cur_val;
						return acc
						} , {})
					options = [options, options];
					break;
				case "cpi_index":
					options = Object.keys(cpi_index["USA"][0]).filter(d=>(d!= "date"));
					options = options.reduce(function (acc, cur_val){
						acc[cur_val] = cur_val;
						return acc
						} , {})
					options = Array(options);
				case "fx_rates":
				// fx_rates test
					break;
				case "interest_rates":
					break;
			}
			paragraph.attr("data_type_selection", data_type);
			if(options.length >0){
				paragraph.selectAll("select.curve_control").data(options).enter()
						.append("select").attr("data_index_in_options", (d,i) => i)
						.attr("class", "curve_control data_selection");
				
				paragraph.selectAll("select.curve_control")
						.selectAll("option")
						.data(Object.values(options[0])).enter()
						.append("option").attr("value", d=> invert_dict(options[0])[d])
						.html(d=>d);
			}
			if(res){
				paragraph.append("select").attr("id", "rel_abs" + number_curve)
						.attr("class", "curve_control")
						.selectAll("option")
						.data(["Relatif", "Absolu", "day-day %"]).enter()
						.append("option").attr("value", d=> d)
						.html(d=>d);
			}
		return res // true if we selected something and false if not
	}
	function has_a_data_type_been_selected(number_curve){
		let paragraph = d3.select("#div_curve_"+String(number_curve) + " p.paragraph_curve_selection");
		let data_type = paragraph.select("select.data_type_selection").node().value;
		return (data_type!="none") && (data_type!=undefined)
	}
	function has_data_type_changed(number_curve){
		let paragraph = d3.select("#div_curve_"+String(number_curve) + " p.paragraph_curve_selection");
		let data_type = paragraph.select("select.data_type_selection").node().value;
		let old_data_type = paragraph.attr("data_type_selection");
		return data_type != old_data_type
	}
	
}
