import { select, json, geoPath, geoAlbersUsa, csv } from 'd3';
import { feature } from 'topojson';

let wageData;
let countyURL = 'https://cdn.jsdelivr.net/npm/us-atlas@3.0.0/counties-10m.json';

const svg1 = d3.select("#svg1")
  .append("svg")
  .attr("viewBox", "0 0 1500 500");

var map = svg1.append("g"),
    circles = svg1.append("g"),
		colors = svg1.append("g");

var div = select("body").append("div")   
    		.attr("class", "tooltip")               
    		.style("opacity", 0);

const projection = geoAlbersUsa();
const pathGenerator = geoPath().projection(projection);

const colorScale = d3.scaleOrdinal()
	.domain(['Private', 'Public'])
	.range(['orange', 'yellow']);
const colorScale2 = d3.scaleThreshold()
  .domain([30000, 35000, 40000, 45000, 50000])
  .range(["#e7f2fe", "#b6d9fb", "#86bff9", "#3d99f5", "#0b73da", "#08529D"]);

const colorLegend = (selection, props) => {
	const { colorScale, recwidth, recheight, spacing, textOffset } = props;
  const groups = selection.selectAll('g').data(colorScale.domain());
  const groupsEnter = groups.enter().append('g');
  
  groupsEnter.merge(groups)
  	.attr('transform', (d, i) => `translate(0, ${i * spacing})`);
  groups.exit().remove();
  
  groupsEnter.append('rect')
  	.merge(groups.select('rect'))
  	.attr("width", recwidth)
  	.attr("height", recheight)
  	.attr("stroke", "black")
  	.attr('fill', colorScale);
  
  groupsEnter.append('text')
  	.merge(groups.select('text'))
  	.text(d => d)
  	.attr('dy', '0.32em')
    .attr('x', textOffset)
    .attr("font-weight", "bold");
};

function HighlightCircle(school) {
  d3.selectAll("circle").each(function(d) {
    if (d.Institution == school) {
      d3.select(this)
        .transition()
        .duration("50")
        .attr('r', 10)
        .attr("stroke", "white")
        .attr("stroke-width", 4);
    }
  }) 
}

json(countyURL).then( (data) => {
  const countyData = feature(data, data.objects.states);
  
  csv("Wages.csv").then( (data) => {
  	wageData = data;
    wageData.forEach( d => { d.MedianWage = +d.MedianWage; })
    map.selectAll('path')
      .data(countyData.features)
      .enter()
      .append('path')
      .attr('class', 'state')
      .attr('d', (d) => pathGenerator(d))
      .attr("fill", "#08529D")
      .attr('fill', function(d) {
        return colorScale2(wageData.find( (item) => { 
          return item.State === d.properties.name; 
        }).MedianWage)
      }); 
  })
});

d3.csv("top-30.csv").then( (data) => {
  data.forEach( d => {
    d.Longitude = +d.Longitude;
    d.Latitude = +d.Latitude;
  });

  circles.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
  	.attr("class", function(d) { return d.Category; })
    .attr("cx", function(d) {
      return projection([d.Longitude, d.Latitude])[0];
    })
    .attr("cy", function(d) {
      return projection([d.Longitude, d.Latitude])[1];
    })
    .attr('r', 8)
    .attr("fill", function(d) {
  		var val = d.Category;
    	if (val == "Public") { return "yellow"; }
    	else { return "orange"; }
  	})
    .attr("stroke", "black")
    .attr("stroke-width", 2)
  	.attr("opacity", .9)
    .on("mouseover", function(d) {
      d3.select(this)
        .transition()
        .duration("50")
        .attr('r', 10)
        .attr("stroke", "white")
        .attr("stroke-width", 4);
      div.transition()        
       .duration(200)      
       .style("opacity", .9);      
      div.text(d.Institution + "\nCity: " + d.City + ", " + d.State + "\nNational Rank: " + d.Rank)
       .style("left", (d3.event.pageX - 60) + "px")     
       .style("top", (d3.event.pageY + 30) + "px");
    	// HighlightRect(d.Institution);
    
      let mySchool = d.Institution;
    	svg2.selectAll("rect")
        .each(function(d) {
          if (d.myschool ===  mySchool) {
            d3.select(this)
              .attr("stroke-width", 5)
              .attr("stroke", "blue");
          }
        })
    })
    .on("mouseout", function(d) {
    	let mySchool = d.Institution;
      div.transition()        
        .duration(200)      
        .style("opacity", 0);  
      d3.select(this)
        .transition()
        .duration("50")
        .attr('r', 5)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
      svg2.selectAll("rect").each(function(d) {
        if (d.myschool ===  mySchool) {
          d3.select(this).attr("stroke-width", 0);
        }
      })
    });
  
	function update(){
    d3.selectAll(".checkbox").each(function() {
      var cb = d3.select(this);
      if (cb.property("checked")) {
        svg1.selectAll("." + cb.property("value"))
          .transition()
          .duration(1000)
          .style("opacity", 1)
          .attr("r", 5);
      } else {
        svg1.selectAll("." + cb.property("value"))
          .transition()
          .duration(1000)
          .style("opacity", 0)
          .attr("r", 0);
      }
    });
	}
  
  d3.selectAll(".checkbox").on("change",update);
  update();
});

colors.attr('transform', `translate(825, 350)`)
	.call(colorLegend, {
  	colorScale,
    recwidth: 10,
  	recheight: 10,
  	spacing: 30,
  	textOffset: 15
  });

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 1060 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

const svg2 = d3.select("#svg2")
  .append("svg")
  .attr("viewBox", "0 0 2500 1500")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height)
  .append("g")

var x = d3.scale.ordinal().rangeRoundBands([0, width], .2);
var y = d3.scale.linear().rangeRound([height, 0]);
var color = d3.scale.ordinal().range(["#2eb82e","#5cd65c","#99e699","#d6f5d6"]);
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y).tickFormat(d3.format(".2s"));  
var active_link = "0";
var legendClassArray = [];
var legendClassArray_orig = [];
var sortDescending;
var restoreXFlag = false;
var class_keep; 

d3.select("label")
  .select("input")
  .property("disabled", true)
  .property("checked", false);

d3.csv("mid-career.csv").then( (data) => {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "School"; }));

  data.forEach(function(d) {
    var myschool = d.School;
    var y0 = 0;
    d.salaries = color.domain().map(function(name) {
      return {
        myschool:myschool,
        name: name,
        y0: y0,
        y1: y0 += +d[name],
        value: d[name],
        y_corrected: 0
      };
    });
    d.total = d.salaries[d.salaries.length - 1].y1;
  });

  data.sort(function(a, b) { return b.total - a.total; });

  x.domain(data.map(function(d) { return d.School; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]);

  svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor","end")
  	.style("font-weight", "bold")
  	.style("font-size", 20)
  	.attr("class", "theAxis")
    .attr("dx","-.8em")
    .attr("dy",".15em")
    .attr("transform", function() {
      return "rotate(-65)"
    });

  svg2.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");
      //.text("Population");

  var school = svg2.selectAll(".school")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + "0" + ",0)"; });
      //.attr("transform", function(d) { return "translate(" + x(d.School) + ",0)"; })

   var height_diff = 0;  //height discrepancy when calculating h based on data vs y(d.y0) - y(d.y1)
   school.selectAll("rect")
      .data(function(d) {
        return d.salaries;
      })
    .enter().append("rect")
      .attr("width", x.rangeBand())
      .attr("y", function(d) {
        height_diff = height_diff + y(d.y0) - y(d.y1) - (y(0) - y(d.value));
        var y_corrected = y(d.y1) + height_diff;
        d.y_corrected = y_corrected //store in d for later use in restorePlot()

        if (d.name === "75 to 90") height_diff = 0; //reset for next d.myschool

        return y_corrected;
        // return y(d.y1);  //orig, but not accurate
      })
      .attr("x",function(d) { //add to stock code
          return x(d.myschool)
        })
      .attr("height", function(d) {
        //return y(d.y0) - y(d.y1); //heights calculated based on stacked values (inaccurate)
        return y(0) - y(d.value); //calculate height directly from value in csv file
      })
      .attr("class", function(d) {
        var classLabel = d.name.replace(/\s/g, ''); //remove spaces
        return "bars class" + classLabel;
      })
      .style("fill", function(d) { return color(d.name); });

  school.selectAll("rect")
       .on("mouseover", function(d){
					HighlightCircle(d.myschool);
          var delta = d.y1 - d.y0;
          var xPos = parseFloat(d3.select(this).attr("x"));
          var yPos = parseFloat(d3.select(this).attr("y"));
          var height = parseFloat(d3.select(this).attr("height"))

          d3.select(this).attr("stroke","blue").attr("stroke-width",5);

          svg2.append("text")
          .attr("x",xPos)
          .attr("y",yPos + height/2 - 40)
    			.style("font-size", 30)
          .attr("class","tooltip")
          .text(d.name + ": $"+ delta);

       })
       .on("mouseout",function(){
    			svg1.selectAll("circle")
            .attr("stroke", "black")
    				.attr("r", 5)
    .attr("stroke-width", 2);
          svg2.select(".tooltip").remove();
          d3.select(this).attr("stroke","pink").attr("stroke-width",0.2);

        })


  var legend = svg2.selectAll(".legend")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      .attr("class", function (d) {
        legendClassArray.push(d.replace(/\s/g, '')); //remove spaces
        legendClassArray_orig.push(d); //remove spaces
        return "legend";
      })
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  //reverse order to match order in which bars are stacked
  legendClassArray = legendClassArray.reverse();
  legendClassArray_orig = legendClassArray_orig.reverse();

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
  		.attr("height", 18)
      .style("fill", color)
      .attr("id", function (d, i) {
        return "id" + d.replace(/\s/g, '');
      })
      .on("mouseover",function(){

        if (active_link === "0") d3.select(this).style("cursor", "pointer");
        else {
          if (active_link.split("class").pop() === this.id.split("id").pop()) {
            d3.select(this).style("cursor", "pointer");
          } else d3.select(this).style("cursor", "auto");
        }
      })
      .on("click",function(d){

        if (active_link === "0") { //nothing selected, turn on this selection
          d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", 2);

            active_link = this.id.split("id").pop();
            plotSingle(this);
						var sortBy = 0;
            //gray out the others
            for (i = 0; i < legendClassArray.length; i++) {
              if (legendClassArray[i] != active_link) {
                d3.select("#id" + legendClassArray[i])
                  .style("opacity", 0.5);
              } else sortBy = i; //save index for sorting in change()
            }

            //enable sort checkbox
            d3.select("label").select("input").property("disabled", false)
            d3.select("label").style("color", "black")
            //sort the bars if checkbox is clicked
            d3.select("#sort").on("change", change);

        } else { //deactivate
          if (active_link === this.id.split("id").pop()) {//active square selected; turn it OFF
            d3.select(this)
              .style("stroke", "none");

            //restore remaining boxes to normal opacity
            for (var i = 0; i < legendClassArray.length; i++) {
                d3.select("#id" + legendClassArray[i])
                  .style("opacity", 1);
            }


            if (d3.select("label").select("input").property("checked")) {
              restoreXFlag = true;
            }

            //disable sort checkbox
            d3.select("label")
              .style("color", "#D8D8D8")
              .select("input")
              .property("disabled", true)
              .property("checked", false);


            //sort bars back to original positions if necessary
            change(sortBy);

            //y translate selected category bars back to original y posn
            restorePlot(d);

            active_link = "0"; //reset
          }

        } //end active_link check


      });

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
  		.style("font-weight", "bold")
      .text(function(d) { return d; });

  // restore graph after a single selection
  function restorePlot(d) {
    //restore graph after a single selection
    d3.selectAll(".bars:not(.class" + class_keep + ")")
          .transition()
          .duration(1000)
          .delay(function() {
            if (restoreXFlag) return 3000;
            else return 750;
          })
          .attr("width", x.rangeBand()) //restore bar width
          .style("opacity", 1);

    //translate bars back up to original y-posn
    d3.selectAll(".class" + class_keep)
      .attr("x", function(d) { return x(d.myschool); })
      .transition()
      .duration(1000)
      .delay(function () {
        if (restoreXFlag) return 2000; //bars have to be restored to orig posn
        else return 0;
      })
      .attr("y", function(d) {
        //return y(d.y1); //not exactly correct since not based on raw data value
        return d.y_corrected;
      });

    //reset
    restoreXFlag = false;

  }

  // plot only a single legend selection
  function plotSingle(d) {

    class_keep = d.id.split("id").pop();
    var idx = legendClassArray.indexOf(class_keep);

    //erase all but selected bars by setting opacity to 0
    d3.selectAll(".bars:not(.class" + class_keep + ")")
          .transition()
          .duration(1000)
          .attr("width", 0) // use because svg has no zindex to hide bars so can't select visible bar underneath
          .style("opacity", 0);

    //lower the bars to start on x-axis
    school.selectAll("rect").each(function (d, i) {

      //get height and y posn of base bar and selected bar
      h_keep = d3.select(d[idx]).attr("height");
      y_keep = d3.select(d[idx]).attr("y");

      h_base = d3.select(d[0]).attr("height");
      y_base = d3.select(d[0]).attr("y");

      h_shift = h_keep - h_base;
      y_new = y_base - h_shift;

      //reposition selected bars
      d3.select(d[idx])
        .transition()
        .ease("bounce")
        .duration(1000)
        .delay(750)
        .attr("y", y_new);

    })

  }

  function change(sortBy) {
		d3.select("#sort").each(function(d) {
    if (d3.select(this).property("checked")) sortDescending = true;
    else sortDescending = false;
    })
    var colName = legendClassArray_orig[sortBy];

    var x0 = x.domain(data.sort(sortDescending
        ? function(a, b) { return b[colName] - a[colName]; }
        : function(a, b) { return b.total - a.total; })
        .map(function(d,i) { return d.School; }))
        .copy();

    school.selectAll(".class" + active_link)
         .sort(function(a, b) {
            return x0(a.myschool) - x0(b.myschool);
          });

    var transition = svg2.transition().duration(750),
        delay = function(d, i) { return i * 20; };

    //sort bars
    transition.selectAll(".class" + active_link)
      .delay(delay)
      .attr("x", function(d) {
        return x0(d.myschool);
      });

    //sort x-labels accordingly
    transition.select(".x.axis")
        .call(xAxis)
        .selectAll("g")
        .delay(delay);


    transition.select(".x.axis")
        .call(xAxis)
      .selectAll("g")
        .delay(delay);
  }
})