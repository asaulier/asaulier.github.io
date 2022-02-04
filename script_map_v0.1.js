async function fetch_data_world(){return d3.json("https://unpkg.com/world-atlas@1/world/50m.json")}
async function fetch_data_countries() {return d3.csv("https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv")}
async function main_map(){
//importing and defining global variables
let countries_codes = await fetch_data_countries();
let world = await fetch_data_world();
let countries = topojson.feature(world, world.objects.countries);

const w= 500;
const h = 400;

let countries_hash = new Map(countries_codes.map(d => [d['country-code'], d.name]));
function geo_map(w=800, h=300, g){
  const svg =
    g ||
    d3.select("#map")
      .append("svg")
      .attr("viewBox", [0, 0, w, h])
      .attr("width", w)
      .attr("height", h)
	  .style("border","solid");
	d3.select("#map svg").append("rect").attr("x",0).attr("y",0)
	.attr("width",w).attr("height",h).attr("fill-opacity",0.2).attr("stroke-opacity",1);
  
let margin = { top: 0, right: 0, bottom: 0, left: 0 };

  let width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;
  
let projection = d3.geoMiller()//.precision(10)
  .fitSize([w*1.3, h*1.3*1.1], countries) // in order to exclude the Antartic
  .clipExtent([[0,0],[width*0.9, height]]) //cutting the map at limits
  .translate([width*0.46, height*0.65])
  
 let path = d3.geoPath(projection);

// Make sure that when mouse hovers over the country and then disappears, we do not delete the description linked to the country 
// because mouse might still be over the description
let mouse_over_legend = 0;
let should_legend_be_deleted = 0;

d3.select("#legend").on("mouseover", d=>{mouse_over_legend = 1})
                    .on("mouseout", d=> {mouse_over_legend = 0;
                                    if(should_legend_be_deleted){d3.select(this).remove()}}) // if mouse is neither over the country nor the legend
                                                                                            // we delete the legend

// plotting the map
  svg.append("g").selectAll("path")
    .data(topojson.feature(world, world.objects.countries).features.filter(d=> d.id != "010"))//we delete antartica
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", d=> d.id == "010" ? "red":"black")
    .attr("class", "drawing_country")
    .style('fill-opacity', 0.8)
    .attr("name-country", d => { 
      return countries_hash.get(d.id)
    })
    .attr("id",d=> "path_"+ d.id) 
    
    .on("mouseover", (e, d) => { svg.append("text").attr("class", "hover_legend").attr("x", e.offsetX).attr("y", e.offsetY)
                                  .text(countries_hash.get(d.id)).attr("data-id", d.id)
                                  })
    .on("mouseout", function (){ //should_legend_be_deleted = 1; d3.select("#path_012").attr("fill","black");
                      d3.selectAll("text.hover_legend").on("mouseout",function(){d3.selectAll("text.hover_legend").remove()});
                })
      
    
    .on('click', function (e,d) {
              svg.append("text").attr("class", "click_legend") //different type of class so the previous mouseover doesn't delete it
              .attr("x", e.offsetX).attr("y", e.offsetY).text(countries_hash.get(d.id)); 
                  });

  // ça ne marche paaaaaaas !!!!
  svg.selectAll(".hover_legend").on("click", function (){
                            svg.select("#path_004").attr("fill","red");
                            let text_legend = d3.select(this);
                            const name_country = countries_hash.get(text_legend.getAttribute("data-id"));
                            const legend_x = text_legend.getAttribute("x");const legend_y = text_legend.getAttribute("y");
                            
                            svg.append("text").attr("class", "click_legend") //different type of class so the previous mouseover doesn't delete it
                            .attr("x", legend_x).attr("y", legend_y).text(name_country); 
                            d3.select(this).remove();
                  })
  return svg.node()
}
return geo_map();

}