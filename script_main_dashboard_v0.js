
function main_dashboard(countries_codes, colors){
// SPECIAL MARKETS SECTION
		
	//adding add button
	d3.select("#add_button")
	.html("Special markets " + generate_add_button(10));
	//adding the selection options
	d3.selectAll("#add_button svg.svg_add_button")
	.attr("id", "adding_special_markets_button")
	.on("click", function (){
			adding_select_special_markets();
			// when user selects a special market
			d3.selectAll("p.special_markets_temporary_selection_block select")
				.on("change", function (){
					handling_temporary_special_markets_selection(this, countries_codes, colors);
					});
		
		});
}