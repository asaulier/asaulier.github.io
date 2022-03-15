/* 
Script plotting a world map with an svg inside div with id="curve_for_map"
v0.2 : besides the last version, it includes an interaction with the map,
capable of selecting countries by clicking on them and adding their names on the 
main dashboard but also removing them
v0.3 : including zoom and coloring the country when hover

*/

function main_map(countries_codes, world, colors){

let each_div_width_height = get_div_dimension_based_on_window_size();
d3.select(d3.select("#map").node().parentNode)
	//.style("padding-right", "5px")
	.style("width", each_div_width_height["width"])
	.style("height", each_div_width_height["height"]);

let w = each_div_width_height["width"];
let h = each_div_width_height["height"];
console.log(w)
let countries = topojson.feature(world, world.objects.countries);
let countries_hash = new Map(countries_codes.map(d => [d['country-code'], d.name])); // assigning a string number to a country's name


function geo_map(w, h){
  const svg =
    d3.select("#map")
      .append("svg")
      .attr("viewBox", [0, 0, w, h])
      .attr("width", w)
      .attr("height", h)
	  .style("border","solid");
	// adding a blue colored background to the map
	d3.select("#map svg").append("rect").attr("x",0).attr("y",0).attr("width",w)
	.attr("height",h).attr("fill", "#006699").attr("fill-opacity",0.2).attr("stroke-opacity",1);
  
	let margin = { top: 0, right: 0, bottom: 0, left: 0 };

	let width = w - margin.left - margin.right,
		height = h - margin.top - margin.bottom;
	  
	let projection = d3.geoMiller()//.precision(10)
	  .fitSize([w*1.3, h*1.3*1.1], countries) // in order to exclude the Antartic
	  .clipExtent([[0,0],[width*0.9, height]]) //cutting the map at limits
	  .translate([width*0.46, height*0.65])
	  
	 let path = d3.geoPath(projection);

																								// we delete the legend
	//zoom interaction
	const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', zoomed);
	svg.call(zoom);
	// plotting the map
	svg.append("g").selectAll("path")
		//we take out antartica
    .data(topojson.feature(world, world.objects.countries).features.filter(d=> d.id != "010"))//we delete antartica
    .enter()
    .append("path")
    .attr("d", path)
	.attr("class", "drawing_country")
    .attr("fill", d=> { 
		//is the country's alpha-3 code inside the list of countries of which we have stockmarket info ? 
		return Object.keys(table_market_country()).includes(convert_country_identification("country-code", "alpha-3", d.id, countries_codes))? // 
			"grey":"#EAEAEA";
			})
    .style('fill-opacity', 0.8)
	.attr("stroke", "white")
	.attr("stroke-width", 0.5)
    .attr("name-country", d => { 
			return countries_hash.get(d.id)
		})
	.attr("data_id_country", d=>d.id)
    .attr("id",d=> "path_"+ d.id) 
    
	// when a country is hovered, we add his name on the country_dashboard in grey
    
	.on("mouseover", (e, d) => { 
		// if we have available data on the country
		if(Object.keys(table_market_country()).includes(convert_country_identification("country-code", "alpha-3", d.id, countries_codes)))
			{	
				d3.select("#temporary_country_dashboard").append("p")
				.attr("class", "temporary_country_selection_block")
				.style("margin",0)
				.attr("data_id_country", d.id)
				.html(countries_hash.get(d.id))
				.style("color","grey");
			}
		})
    .on("mouseout", function (){
                      d3.selectAll("#temporary_country_dashboard p.temporary_country_selection_block").remove();
        })
    
    // this .on("click", ...) is about displaying the selected country on the main dashboard
    .on('click', function (e,d) {
		//tous les pays selectionnés:
		var main_selection_country = []; 
		//push all the id of selected countries in main_selection_country
		d3.selectAll(".country_selection_block").each(function (d) {main_selection_country.push(d3.select(this).attr("data_id_country"))});
		// colors already used
		var list_colors_in_use = get_curve_selection(countries_codes).map(d=>fill_color_of_selection_block(d, countries_codes));
		//checking if we did not already select it
		console.log("colors in use")
		console.log(list_colors_in_use)
		if( (!main_selection_country.includes(d3.select(this).attr("data_id_country")))
			// and if we have data on the country
			&& (Object.keys(table_market_country()).includes(convert_country_identification("country-code", "alpha-3", d.id, countries_codes)))
			){
			//displaying the country selected on the dashboard (main_selection)
			d3.select("#country_dashboard").append("p")
			.attr("class", "country_selection_block")
			.style("background-color", 
						// we need to handle the case where there is no selection
						d=> get_curve_selection(countries_codes)== undefined  ?
						colors[0]:
						element_from_l1_not_in_l2(colors.slice(3), list_colors_in_use) 
					)
			.style("opacity",0.8)
			.attr("data_id_country", d.id)
			.html(countries_hash.get(d.id)+ " " + generate_cancel_button(10));
			
			//turning the country black
			d3.select(this)
			.attr("fill", d=> get_curve_selection(countries_codes)== undefined  ?
						colors[0]:
						element_from_l1_not_in_l2(colors.slice(3), list_colors_in_use)  //number of blocks of country selected on the main dashboard
						)
			.style('fill-opacity', 0.8)
			.attr("stroke", "red")
			.attr("stroke-width", 0.5)
		}
		//if we already selected it, we need to deselect it
		else{
			//reset the path's style
			d3.select(this)
			.attr("fill", d=> { 
					//is the country's alpha-3 code inside the list of countries of which we have stockmarket info ? 
					return Object.keys(table_market_country()).includes(convert_country_identification("country-code", "alpha-3", d.id, countries_codes))? // 
						"grey":"#EAEAEA";
				})
			.style('fill-opacity', 0.8)
			.attr("stroke", "white")
			.attr("stroke-width", 0.5);
			// deleting the name of the country from the main dashboard
			d3.selectAll("#country_dashboard p").filter(function (){return d3.select(this).attr("data_id_country") == d.id}).remove()
		}
		
		// color the lines of the svg 
		d3.selectAll("#country_dashboard p svg.svg_cancel_button")
		.on("mouseover", function (){d3.select(this).selectAll("line").attr("stroke","grey");})
		.on("mouseout", function (){d3.select(this).selectAll("line").attr("stroke","black");})
		// when user wants to delete selection
		.on("click", function (){
				// saving the id of the country we have to delete
				const id_country = d3.select(this).node().parentNode.getAttribute("data_id_country");
				// remove the p from the country_dashboard dashboard
				d3.select(this).node().parentNode.remove();
				//all the ids of the countries selected
				let main_selection_country = get_id_selected_countries();
				
				// we reset the color and stroke color of the map according to the new selection
				d3.select("#map svg").selectAll("path")
					.attr("fill", function une_fonction(d){ 
						// if the country is selected then ...
						return main_selection_country.includes(d.id)? 
							d3.select(this).attr("fill"):
							// else ...
							// if the country's alpha-3 code is inside the list of countries of which we have stockmarket info ? 
							Object.keys(table_market_country()).includes(convert_country_identification("country-code", "alpha-3", d.id, countries_codes))? // 
							"grey":"#EAEAEA";
						})
					.style('fill-opacity', 0.8)
					.attr("stroke", function (d) { return main_selection_country.includes(d.id) ? "red" : "white"})
					.attr("stroke-width", 0.5)
				
			});
		
		});
		
		
		function zoomed(){
		svg
        .selectAll('g path') // To prevent stroke width from scaling
        .attr('transform', d3.zoomTransform(this));
    }
	
  // ça ne marche paaaaaaas !!!!
  /*
  svg.selectAll(".hover_legend").on("click", function (){
                            svg.select("#path_004").attr("fill","red");
                            let text_legend = d3.select(this);
                            const name_country = countries_hash.get(text_legend.getAttribute("data-id"));
                            const legend_x = text_legend.getAttribute("x");const legend_y = text_legend.getAttribute("y");
                            
                            svg.append("text").attr("class", "click_legend") //different type of class so the previous mouseover doesn't delete it
                            .attr("x", legend_x).attr("y", legend_y).text(name_country); 
                            d3.select(this).remove();
                  }) */
  return svg.node()
}
return geo_map(w,h);
}