(function (d3$1, topojson) {
  'use strict';

  let wageData;
  let countyURL = 'https://cdn.jsdelivr.net/npm/us-atlas@3.0.0/counties-10m.json';

  const svg1 = d3.select("#svg1")
    .append("svg")
    .attr("viewBox", "0 0 1500 500");

  var map = svg1.append("g"),
      circles = svg1.append("g"),
  		colors = svg1.append("g"),
  		quant = svg1.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");

  var div = d3$1.select("body")
  		    .append("div")   
      		.attr("class", "tooltip")               
      		.style("opacity", 0);

  const projection = d3$1.geoAlbersUsa();
  const pathGenerator = d3$1.geoPath().projection(projection);

  const colorScale = d3.scaleOrdinal()
  	.domain(['Private', 'Public'])
  	.range(['orange', 'yellow']);
  const colorScale2 = d3.scaleThreshold()
    .domain([30000, 35000, 40000, 45000, 50000])
    .range(["#e7f2fe", "#b6d9fb", "#86bff9", "#3d99f5", "#0b73da", "#08529D"]);

  const colorLegend = (selection, props) => {
  	const { colorScale, recwidth, recheight, spacing, textOffset } = props;
    const groups = selection.selectAll('g')
    	.data(colorScale.domain());
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


  function HighlightCircle(school){
    d3.selectAll("circle").each(function(d,i){
      if (d.Institution == school)
        d3.select(this).transition()
          .duration("50")
          .attr('r', 10)
          .attr("stroke", "white")
          .attr("stroke-width", 4);
    }); 
  }

  d3$1.json(countyURL).then( (data) => {
    const countyData = topojson.feature(data, data.objects.states);
    
    d3$1.csv("Wages.csv").then( (data) => {
    	wageData = data;
      wageData.forEach( d => { d.MedianWage = +d.MedianWage; });
      map.selectAll('path')
    	.data(countyData.features)
      .enter()
      .append('path')
      .attr('class', 'state')
      .attr('d', (d) => pathGenerator(d))
      .attr("fill", "#08529D")
    	.attr('fill', function(d){
        return colorScale2(wageData.find( (item) => 
                                  { return item.State === d.properties.name; }).MedianWage
                    )}); 
    });
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
      .attr("fill", function(d){
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
      	//HighlightRect(d.Institution);
      let mySchool = d.Institution;
      	svg2.selectAll("rect").each(function(d,i){
      if (d.myschool ===  mySchool)
        d3.select(this)
          .attr("stroke-width", 5).attr("stroke", "blue");});
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
      svg2.selectAll("rect").each(function(d,i){
      if (d.myschool ===  mySchool)
        d3.select(this)
          .attr("stroke-width", 0);});
      });
    
  	function update(){
      d3.selectAll(".checkbox").each(function(d){
        var cb = d3.select(this);
        if(cb.property("checked")){
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
    
    d3.selectAll(".checkbox")
      .on("change",update);
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
    .append("g");
      //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .2);
   
  var y = d3.scale.linear()
      .rangeRound([height, 0]);
   
  var color = d3.scale.ordinal()
      .range(["#2eb82e","#5cd65c","#99e699","#d6f5d6"]);
  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y)
  	.tickFormat(d3.format(".2s"));  


  var active_link = "0"; //to control legend selections and hover
  var legendClassArray = []; //store legend classes to select bars in plotSingle()
  var legendClassArray_orig = []; //orig (with spaces)
  var sortDescending; //if true, bars are sorted by height in descending order
  var restoreXFlag = false; //restore order of bars back to original
  var class_keep; 


  //disable sort checkbox
  d3.select("label")
    .select("input")
    .property("disabled", true)
    .property("checked", false);

  d3.csv("mid-career.csv").then( (data) => {

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "School"; }));

    data.forEach(function(d) {
      var myschool = d.School; //add to stock code
      var y0 = 0;
      //d.salaries = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
      d.salaries = color.domain().map(function(name) {
        //return { myschool:myschool, name: name, y0: y0, y1: y0 += +d[name]}; });
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

    //Sort totals in descending order
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
          .attr("transform", function(d) {
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
          d.y_corrected = y_corrected; //store in d for later use in restorePlot()

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
            var height = parseFloat(d3.select(this).attr("height"));

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

          });


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
              d3.select("label").select("input").property("disabled", false);
              d3.select("label").style("color", "black");
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
              restorePlot();

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

      });

    }

    function change(sortBy) {
  		d3.select("#sort").each(function(d) {
      if (d3.select(this).property("checked")) sortDescending = true;
      else sortDescending = false;
      });
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
  });

}(d3, topojson));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNlbGVjdCwganNvbiwgZ2VvUGF0aCwgZ2VvQWxiZXJzVXNhLCBnZW9NZXJjYXRvciwgem9vbSwgcXVldWUsIGNzdiwgbGVnZW5kQ29sb3IgfSBmcm9tICdkMyc7XG5pbXBvcnQgeyBmZWF0dXJlLG1lc2ggfSBmcm9tICd0b3BvanNvbic7XG5cbmxldCBjb3VudHlEYXRhO1xubGV0IHdhZ2VEYXRhO1xubGV0IGNvdW50eVVSTCA9ICdodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL3VzLWF0bGFzQDMuMC4wL2NvdW50aWVzLTEwbS5qc29uJztcblxuY29uc3Qgc3ZnMSA9IGQzLnNlbGVjdChcIiNzdmcxXCIpXG4gIC5hcHBlbmQoXCJzdmdcIilcbiAgLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDE1MDAgNTAwXCIpO1xuXG52YXIgbWFwID0gc3ZnMS5hcHBlbmQoXCJnXCIpLFxuICAgIGNpcmNsZXMgPSBzdmcxLmFwcGVuZChcImdcIiksXG5cdFx0Y29sb3JzID0gc3ZnMS5hcHBlbmQoXCJnXCIpLFxuXHRcdHF1YW50ID0gc3ZnMS5hcHBlbmQoXCJnXCIpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwibGVnZW5kUXVhbnRcIilcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDIwLDIwKVwiKTtcblxudmFyIGRpdiA9IHNlbGVjdChcImJvZHlcIilcblx0XHQgICAgLmFwcGVuZChcImRpdlwiKSAgIFxuICAgIFx0XHQuYXR0cihcImNsYXNzXCIsIFwidG9vbHRpcFwiKSAgICAgICAgICAgICAgIFxuICAgIFx0XHQuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuXG5jb25zdCBwcm9qZWN0aW9uID0gZ2VvQWxiZXJzVXNhKCk7XG5jb25zdCBwYXRoR2VuZXJhdG9yID0gZ2VvUGF0aCgpLnByb2plY3Rpb24ocHJvamVjdGlvbik7XG5cbmNvbnN0IGNvbG9yU2NhbGUgPSBkMy5zY2FsZU9yZGluYWwoKVxuXHQuZG9tYWluKFsnUHJpdmF0ZScsICdQdWJsaWMnXSlcblx0LnJhbmdlKFsnb3JhbmdlJywgJ3llbGxvdyddKTtcbmNvbnN0IGNvbG9yU2NhbGUyID0gZDMuc2NhbGVUaHJlc2hvbGQoKVxuICAuZG9tYWluKFszMDAwMCwgMzUwMDAsIDQwMDAwLCA0NTAwMCwgNTAwMDBdKVxuICAucmFuZ2UoW1wiI2U3ZjJmZVwiLCBcIiNiNmQ5ZmJcIiwgXCIjODZiZmY5XCIsIFwiIzNkOTlmNVwiLCBcIiMwYjczZGFcIiwgXCIjMDg1MjlEXCJdKTtcblxuY29uc3QgY29sb3JMZWdlbmQgPSAoc2VsZWN0aW9uLCBwcm9wcykgPT4ge1xuXHRjb25zdCB7IGNvbG9yU2NhbGUsIHJlY3dpZHRoLCByZWNoZWlnaHQsIHNwYWNpbmcsIHRleHRPZmZzZXQgfSA9IHByb3BzO1xuICBjb25zdCBncm91cHMgPSBzZWxlY3Rpb24uc2VsZWN0QWxsKCdnJylcbiAgXHQuZGF0YShjb2xvclNjYWxlLmRvbWFpbigpKTtcbiAgY29uc3QgZ3JvdXBzRW50ZXIgPSBncm91cHMuZW50ZXIoKS5hcHBlbmQoJ2cnKTtcbiAgXG4gIGdyb3Vwc0VudGVyLm1lcmdlKGdyb3VwcylcbiAgXHQuYXR0cigndHJhbnNmb3JtJywgKGQsIGkpID0+IGB0cmFuc2xhdGUoMCwgJHtpICogc3BhY2luZ30pYCk7XG4gIGdyb3Vwcy5leGl0KCkucmVtb3ZlKCk7XG4gIFxuICBncm91cHNFbnRlci5hcHBlbmQoJ3JlY3QnKVxuICBcdC5tZXJnZShncm91cHMuc2VsZWN0KCdyZWN0JykpXG4gIFx0LmF0dHIoXCJ3aWR0aFwiLCByZWN3aWR0aClcbiAgXHQuYXR0cihcImhlaWdodFwiLCByZWNoZWlnaHQpXG4gIFx0LmF0dHIoXCJzdHJva2VcIiwgXCJibGFja1wiKVxuICBcdC5hdHRyKCdmaWxsJywgY29sb3JTY2FsZSk7XG4gIFxuICBncm91cHNFbnRlci5hcHBlbmQoJ3RleHQnKVxuICBcdC5tZXJnZShncm91cHMuc2VsZWN0KCd0ZXh0JykpXG4gIFx0LnRleHQoZCA9PiBkKVxuICBcdC5hdHRyKCdkeScsICcwLjMyZW0nKVxuICAgIC5hdHRyKCd4JywgdGV4dE9mZnNldClcbiAgICAuYXR0cihcImZvbnQtd2VpZ2h0XCIsIFwiYm9sZFwiKTtcbn07XG5cblxuZnVuY3Rpb24gSGlnaGxpZ2h0Q2lyY2xlKHNjaG9vbCl7XG4gIGQzLnNlbGVjdEFsbChcImNpcmNsZVwiKS5lYWNoKGZ1bmN0aW9uKGQsaSl7XG4gICAgaWYgKGQuSW5zdGl0dXRpb24gPT0gc2Nob29sKVxuICAgICAgZDMuc2VsZWN0KHRoaXMpLnRyYW5zaXRpb24oKVxuICAgICAgICAuZHVyYXRpb24oXCI1MFwiKVxuICAgICAgICAuYXR0cigncicsIDEwKVxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcIndoaXRlXCIpXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDQpO1xuICB9KSBcbn1cblxuanNvbihjb3VudHlVUkwpLnRoZW4oIChkYXRhKSA9PiB7XG4gIGNvbnN0IGNvdW50eURhdGEgPSBmZWF0dXJlKGRhdGEsIGRhdGEub2JqZWN0cy5zdGF0ZXMpO1xuICBcbiAgY3N2KFwiV2FnZXMuY3N2XCIpLnRoZW4oIChkYXRhKSA9PiB7XG4gIFx0d2FnZURhdGEgPSBkYXRhO1xuICAgIHdhZ2VEYXRhLmZvckVhY2goIGQgPT4geyBkLk1lZGlhbldhZ2UgPSArZC5NZWRpYW5XYWdlOyB9KVxuICAgIHZhciBpdGVtO1xuICAgIG1hcC5zZWxlY3RBbGwoJ3BhdGgnKVxuICBcdC5kYXRhKGNvdW50eURhdGEuZmVhdHVyZXMpXG4gICAgLmVudGVyKClcbiAgICAuYXBwZW5kKCdwYXRoJylcbiAgICAuYXR0cignY2xhc3MnLCAnc3RhdGUnKVxuICAgIC5hdHRyKCdkJywgKGQpID0+IHBhdGhHZW5lcmF0b3IoZCkpXG4gICAgLmF0dHIoXCJmaWxsXCIsIFwiIzA4NTI5RFwiKVxuICBcdC5hdHRyKCdmaWxsJywgZnVuY3Rpb24oZCl7XG4gICAgICByZXR1cm4gY29sb3JTY2FsZTIod2FnZURhdGEuZmluZCggKGl0ZW0pID0+IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJldHVybiBpdGVtLlN0YXRlID09PSBkLnByb3BlcnRpZXMubmFtZTsgfSkuTWVkaWFuV2FnZVxuICAgICAgICAgICAgICAgICAgKX0pOyBcbiAgfSlcbn0pO1xuXG5kMy5jc3YoXCJ0b3AtMzAuY3N2XCIpLnRoZW4oIChkYXRhKSA9PiB7XG4gIGRhdGEuZm9yRWFjaCggZCA9PiB7XG4gICAgZC5Mb25naXR1ZGUgPSArZC5Mb25naXR1ZGU7XG4gICAgZC5MYXRpdHVkZSA9ICtkLkxhdGl0dWRlO1xuICB9KTtcblxuICBjaXJjbGVzLnNlbGVjdEFsbChcImNpcmNsZVwiKVxuICAgIC5kYXRhKGRhdGEpXG4gICAgLmVudGVyKClcbiAgICAuYXBwZW5kKFwiY2lyY2xlXCIpXG4gIFx0LmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLkNhdGVnb3J5OyB9KVxuICAgIC5hdHRyKFwiY3hcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIHByb2plY3Rpb24oW2QuTG9uZ2l0dWRlLCBkLkxhdGl0dWRlXSlbMF07XG4gICAgfSlcbiAgICAuYXR0cihcImN5XCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBwcm9qZWN0aW9uKFtkLkxvbmdpdHVkZSwgZC5MYXRpdHVkZV0pWzFdO1xuICAgIH0pXG4gICAgLmF0dHIoJ3InLCA4KVxuICAgIC5hdHRyKFwiZmlsbFwiLCBmdW5jdGlvbihkKXtcbiAgXHRcdHZhciB2YWwgPSBkLkNhdGVnb3J5O1xuICAgIFx0aWYgKHZhbCA9PSBcIlB1YmxpY1wiKSB7IHJldHVybiBcInllbGxvd1wiOyB9XG4gICAgXHRlbHNlIHsgcmV0dXJuIFwib3JhbmdlXCI7IH1cbiAgXHR9KVxuICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwiYmxhY2tcIilcbiAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAyKVxuICBcdC5hdHRyKFwib3BhY2l0eVwiLCAuOSlcbiAgICAub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgLmR1cmF0aW9uKFwiNTBcIilcbiAgICAgICAgLmF0dHIoJ3InLCAxMClcbiAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJ3aGl0ZVwiKVxuICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCA0KTtcbiAgICAgIGRpdi50cmFuc2l0aW9uKCkgICAgICAgIFxuICAgICAgIC5kdXJhdGlvbigyMDApICAgICAgXG4gICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAuOSk7ICAgICAgXG4gICAgICBkaXYudGV4dChkLkluc3RpdHV0aW9uICsgXCJcXG5DaXR5OiBcIiArIGQuQ2l0eSArIFwiLCBcIiArIGQuU3RhdGUgKyBcIlxcbk5hdGlvbmFsIFJhbms6IFwiICsgZC5SYW5rKVxuICAgICAgIC5zdHlsZShcImxlZnRcIiwgKGQzLmV2ZW50LnBhZ2VYIC0gNjApICsgXCJweFwiKSAgICAgXG4gICAgICAgLnN0eWxlKFwidG9wXCIsIChkMy5ldmVudC5wYWdlWSArIDMwKSArIFwicHhcIik7XG4gICAgXHQvL0hpZ2hsaWdodFJlY3QoZC5JbnN0aXR1dGlvbik7XG4gICAgbGV0IG15U2Nob29sID0gZC5JbnN0aXR1dGlvbjtcbiAgICBcdHN2ZzIuc2VsZWN0QWxsKFwicmVjdFwiKS5lYWNoKGZ1bmN0aW9uKGQsaSl7XG4gICAgaWYgKGQubXlzY2hvb2wgPT09ICBteVNjaG9vbClcbiAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCA1KS5hdHRyKFwic3Ryb2tlXCIsIFwiYmx1ZVwiKTt9KVxuICAgIH0pXG4gICAgLm9uKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oZCkge1xuICAgIFx0bGV0IG15U2Nob29sID0gZC5JbnN0aXR1dGlvbjtcbiAgICAgIGRpdi50cmFuc2l0aW9uKCkgICAgICAgIFxuICAgICAgICAuZHVyYXRpb24oMjAwKSAgICAgIFxuICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApOyAgXG4gICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAuZHVyYXRpb24oXCI1MFwiKVxuICAgICAgICAuYXR0cigncicsIDUpXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwiYmxhY2tcIilcbiAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMik7XG4gICAgc3ZnMi5zZWxlY3RBbGwoXCJyZWN0XCIpLmVhY2goZnVuY3Rpb24oZCxpKXtcbiAgICBpZiAoZC5teXNjaG9vbCA9PT0gIG15U2Nob29sKVxuICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDApO30pXG4gICAgfSk7XG4gIFxuXHRmdW5jdGlvbiB1cGRhdGUoKXtcbiAgICBkMy5zZWxlY3RBbGwoXCIuY2hlY2tib3hcIikuZWFjaChmdW5jdGlvbihkKXtcbiAgICAgIHZhciBjYiA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICAgIGlmKGNiLnByb3BlcnR5KFwiY2hlY2tlZFwiKSl7XG4gICAgICAgIHN2ZzEuc2VsZWN0QWxsKFwiLlwiICsgY2IucHJvcGVydHkoXCJ2YWx1ZVwiKSlcbiAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmR1cmF0aW9uKDEwMDApXG4gICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKVxuICAgICAgICAgIC5hdHRyKFwiclwiLCA1KTtcbiAgICAgIH0gZWxzZXtcbiAgICAgICAgc3ZnMS5zZWxlY3RBbGwoXCIuXCIgKyBjYi5wcm9wZXJ0eShcInZhbHVlXCIpKVxuICAgICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgICAuZHVyYXRpb24oMTAwMClcbiAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApXG4gICAgICAgICAgLmF0dHIoXCJyXCIsIDApO1xuICAgICAgfVxuICAgIH0pO1xuXHR9XG4gIFxuICBkMy5zZWxlY3RBbGwoXCIuY2hlY2tib3hcIilcbiAgICAub24oXCJjaGFuZ2VcIix1cGRhdGUpO1xuICB1cGRhdGUoKTtcbn0pO1xuXG5jb2xvcnMuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSg4MjUsIDM1MClgKVxuXHQuY2FsbChjb2xvckxlZ2VuZCwge1xuICBcdGNvbG9yU2NhbGUsXG4gICAgcmVjd2lkdGg6IDEwLFxuICBcdHJlY2hlaWdodDogMTAsXG4gIFx0c3BhY2luZzogMzAsXG4gIFx0dGV4dE9mZnNldDogMTVcbiAgfSk7XG5cblxudmFyIG1hcmdpbiA9IHt0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAsIGxlZnQ6IDB9LFxuICAgIHdpZHRoID0gMTA2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0LFxuICAgIGhlaWdodCA9IDU1MCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xuXG5jb25zdCBzdmcyID0gZDMuc2VsZWN0KFwiI3N2ZzJcIilcbiAgLmFwcGVuZChcInN2Z1wiKVxuICAuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMjUwMCAxNTAwXCIpXG4gICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxuICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcbiAgLmFwcGVuZChcImdcIilcbiAgICAvLy5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIik7XG5cbnZhciB4ID0gZDMuc2NhbGUub3JkaW5hbCgpXG4gICAgLnJhbmdlUm91bmRCYW5kcyhbMCwgd2lkdGhdLCAuMik7XG4gXG52YXIgeSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgLnJhbmdlUm91bmQoW2hlaWdodCwgMF0pO1xuIFxudmFyIGNvbG9yID0gZDMuc2NhbGUub3JkaW5hbCgpXG4gICAgLnJhbmdlKFtcIiMyZWI4MmVcIixcIiM1Y2Q2NWNcIixcIiM5OWU2OTlcIixcIiNkNmY1ZDZcIl0pO1xudmFyIHhBeGlzID0gZDMuYXhpc0JvdHRvbSh4KTtcbnZhciB5QXhpcyA9IGQzLmF4aXNMZWZ0KHkpXG5cdC50aWNrRm9ybWF0KGQzLmZvcm1hdChcIi4yc1wiKSk7ICBcblxuXG52YXIgYWN0aXZlX2xpbmsgPSBcIjBcIjsgLy90byBjb250cm9sIGxlZ2VuZCBzZWxlY3Rpb25zIGFuZCBob3ZlclxudmFyIGxlZ2VuZENsaWNrZWQ7IC8vdG8gY29udHJvbCBsZWdlbmQgc2VsZWN0aW9uc1xudmFyIGxlZ2VuZENsYXNzQXJyYXkgPSBbXTsgLy9zdG9yZSBsZWdlbmQgY2xhc3NlcyB0byBzZWxlY3QgYmFycyBpbiBwbG90U2luZ2xlKClcbnZhciBsZWdlbmRDbGFzc0FycmF5X29yaWcgPSBbXTsgLy9vcmlnICh3aXRoIHNwYWNlcylcbnZhciBzb3J0RGVzY2VuZGluZzsgLy9pZiB0cnVlLCBiYXJzIGFyZSBzb3J0ZWQgYnkgaGVpZ2h0IGluIGRlc2NlbmRpbmcgb3JkZXJcbnZhciByZXN0b3JlWEZsYWcgPSBmYWxzZTsgLy9yZXN0b3JlIG9yZGVyIG9mIGJhcnMgYmFjayB0byBvcmlnaW5hbFxudmFyIGNsYXNzX2tlZXA7IFxuXG5cbi8vZGlzYWJsZSBzb3J0IGNoZWNrYm94XG5kMy5zZWxlY3QoXCJsYWJlbFwiKVxuICAuc2VsZWN0KFwiaW5wdXRcIilcbiAgLnByb3BlcnR5KFwiZGlzYWJsZWRcIiwgdHJ1ZSlcbiAgLnByb3BlcnR5KFwiY2hlY2tlZFwiLCBmYWxzZSk7XG5cbmQzLmNzdihcIm1pZC1jYXJlZXIuY3N2XCIpLnRoZW4oIChkYXRhKSA9PiB7XG5cbiAgY29sb3IuZG9tYWluKGQzLmtleXMoZGF0YVswXSkuZmlsdGVyKGZ1bmN0aW9uKGtleSkgeyByZXR1cm4ga2V5ICE9PSBcIlNjaG9vbFwiOyB9KSk7XG5cbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICB2YXIgbXlzY2hvb2wgPSBkLlNjaG9vbDsgLy9hZGQgdG8gc3RvY2sgY29kZVxuICAgIHZhciB5MCA9IDA7XG4gICAgLy9kLnNhbGFyaWVzID0gY29sb3IuZG9tYWluKCkubWFwKGZ1bmN0aW9uKG5hbWUpIHsgcmV0dXJuIHtuYW1lOiBuYW1lLCB5MDogeTAsIHkxOiB5MCArPSArZFtuYW1lXX07IH0pO1xuICAgIGQuc2FsYXJpZXMgPSBjb2xvci5kb21haW4oKS5tYXAoZnVuY3Rpb24obmFtZSkge1xuICAgICAgLy9yZXR1cm4geyBteXNjaG9vbDpteXNjaG9vbCwgbmFtZTogbmFtZSwgeTA6IHkwLCB5MTogeTAgKz0gK2RbbmFtZV19OyB9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG15c2Nob29sOm15c2Nob29sLFxuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICB5MDogeTAsXG4gICAgICAgIHkxOiB5MCArPSArZFtuYW1lXSxcbiAgICAgICAgdmFsdWU6IGRbbmFtZV0sXG4gICAgICAgIHlfY29ycmVjdGVkOiAwXG4gICAgICB9O1xuICAgICAgfSk7XG4gICAgZC50b3RhbCA9IGQuc2FsYXJpZXNbZC5zYWxhcmllcy5sZW5ndGggLSAxXS55MTtcblxuICB9KTtcblxuICAvL1NvcnQgdG90YWxzIGluIGRlc2NlbmRpbmcgb3JkZXJcbiAgZGF0YS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGIudG90YWwgLSBhLnRvdGFsOyB9KTtcblxuICB4LmRvbWFpbihkYXRhLm1hcChmdW5jdGlvbihkKSB7IHJldHVybiBkLlNjaG9vbDsgfSkpO1xuICB5LmRvbWFpbihbMCwgZDMubWF4KGRhdGEsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudG90YWw7IH0pXSk7XG5cbiAgc3ZnMi5hcHBlbmQoXCJnXCIpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzXCIpXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgaGVpZ2h0ICsgXCIpXCIpXG4gICAgICAuY2FsbCh4QXhpcylcbiAgICAgIC5zZWxlY3RBbGwoXCJ0ZXh0XCIpXG4gICAgICAgIC5zdHlsZShcInRleHQtYW5jaG9yXCIsXCJlbmRcIilcbiAgXHRcdFx0LnN0eWxlKFwiZm9udC13ZWlnaHRcIiwgXCJib2xkXCIpXG4gIFx0XHRcdC5zdHlsZShcImZvbnQtc2l6ZVwiLCAyMClcbiAgXHRcdFx0LmF0dHIoXCJjbGFzc1wiLCBcInRoZUF4aXNcIilcbiAgICAgICAgLmF0dHIoXCJkeFwiLFwiLS44ZW1cIilcbiAgICAgICAgLmF0dHIoXCJkeVwiLFwiLjE1ZW1cIilcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBcInJvdGF0ZSgtNjUpXCJcbiAgICAgICAgICB9KTtcblxuICBzdmcyLmFwcGVuZChcImdcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ5IGF4aXNcIilcbiAgICAgIC5jYWxsKHlBeGlzKVxuICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInJvdGF0ZSgtOTApXCIpXG4gICAgICAuYXR0cihcInlcIiwgNilcbiAgICAgIC5hdHRyKFwiZHlcIiwgXCIuNzFlbVwiKVxuICAgICAgLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJlbmRcIik7XG4gICAgICAvLy50ZXh0KFwiUG9wdWxhdGlvblwiKTtcblxuICB2YXIgc2Nob29sID0gc3ZnMi5zZWxlY3RBbGwoXCIuc2Nob29sXCIpXG4gICAgICAuZGF0YShkYXRhKVxuICAgIC5lbnRlcigpLmFwcGVuZChcImdcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJnXCIpXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIFwiMFwiICsgXCIsMClcIjsgfSk7XG4gICAgICAvLy5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgeChkLlNjaG9vbCkgKyBcIiwwKVwiOyB9KVxuXG4gICB2YXIgaGVpZ2h0X2RpZmYgPSAwOyAgLy9oZWlnaHQgZGlzY3JlcGFuY3kgd2hlbiBjYWxjdWxhdGluZyBoIGJhc2VkIG9uIGRhdGEgdnMgeShkLnkwKSAtIHkoZC55MSlcbiAgIHNjaG9vbC5zZWxlY3RBbGwoXCJyZWN0XCIpXG4gICAgICAuZGF0YShmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLnNhbGFyaWVzO1xuICAgICAgfSlcbiAgICAuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcIndpZHRoXCIsIHgucmFuZ2VCYW5kKCkpXG4gICAgICAuYXR0cihcInlcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICBoZWlnaHRfZGlmZiA9IGhlaWdodF9kaWZmICsgeShkLnkwKSAtIHkoZC55MSkgLSAoeSgwKSAtIHkoZC52YWx1ZSkpO1xuICAgICAgICB2YXIgeV9jb3JyZWN0ZWQgPSB5KGQueTEpICsgaGVpZ2h0X2RpZmY7XG4gICAgICAgIGQueV9jb3JyZWN0ZWQgPSB5X2NvcnJlY3RlZCAvL3N0b3JlIGluIGQgZm9yIGxhdGVyIHVzZSBpbiByZXN0b3JlUGxvdCgpXG5cbiAgICAgICAgaWYgKGQubmFtZSA9PT0gXCI3NSB0byA5MFwiKSBoZWlnaHRfZGlmZiA9IDA7IC8vcmVzZXQgZm9yIG5leHQgZC5teXNjaG9vbFxuXG4gICAgICAgIHJldHVybiB5X2NvcnJlY3RlZDtcbiAgICAgICAgLy8gcmV0dXJuIHkoZC55MSk7ICAvL29yaWcsIGJ1dCBub3QgYWNjdXJhdGVcbiAgICAgIH0pXG4gICAgICAuYXR0cihcInhcIixmdW5jdGlvbihkKSB7IC8vYWRkIHRvIHN0b2NrIGNvZGVcbiAgICAgICAgICByZXR1cm4geChkLm15c2Nob29sKVxuICAgICAgICB9KVxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAvL3JldHVybiB5KGQueTApIC0geShkLnkxKTsgLy9oZWlnaHRzIGNhbGN1bGF0ZWQgYmFzZWQgb24gc3RhY2tlZCB2YWx1ZXMgKGluYWNjdXJhdGUpXG4gICAgICAgIHJldHVybiB5KDApIC0geShkLnZhbHVlKTsgLy9jYWxjdWxhdGUgaGVpZ2h0IGRpcmVjdGx5IGZyb20gdmFsdWUgaW4gY3N2IGZpbGVcbiAgICAgIH0pXG4gICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIGNsYXNzTGFiZWwgPSBkLm5hbWUucmVwbGFjZSgvXFxzL2csICcnKTsgLy9yZW1vdmUgc3BhY2VzXG4gICAgICAgIHJldHVybiBcImJhcnMgY2xhc3NcIiArIGNsYXNzTGFiZWw7XG4gICAgICB9KVxuICAgICAgLnN0eWxlKFwiZmlsbFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBjb2xvcihkLm5hbWUpOyB9KTtcblxuICBzY2hvb2wuc2VsZWN0QWxsKFwicmVjdFwiKVxuICAgICAgIC5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihkKXtcblx0XHRcdFx0XHRIaWdobGlnaHRDaXJjbGUoZC5teXNjaG9vbCk7XG4gICAgICAgICAgdmFyIGRlbHRhID0gZC55MSAtIGQueTA7XG4gICAgICAgICAgdmFyIHhQb3MgPSBwYXJzZUZsb2F0KGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwieFwiKSk7XG4gICAgICAgICAgdmFyIHlQb3MgPSBwYXJzZUZsb2F0KGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwieVwiKSk7XG4gICAgICAgICAgdmFyIGhlaWdodCA9IHBhcnNlRmxvYXQoZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJoZWlnaHRcIikpXG5cbiAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcInN0cm9rZVwiLFwiYmx1ZVwiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsNSk7XG5cbiAgICAgICAgICBzdmcyLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAuYXR0cihcInhcIix4UG9zKVxuICAgICAgICAgIC5hdHRyKFwieVwiLHlQb3MgKyBoZWlnaHQvMiAtIDQwKVxuICAgIFx0XHRcdC5zdHlsZShcImZvbnQtc2l6ZVwiLCAzMClcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsXCJ0b29sdGlwXCIpXG4gICAgICAgICAgLnRleHQoZC5uYW1lICsgXCI6ICRcIisgZGVsdGEpO1xuXG4gICAgICAgfSlcbiAgICAgICAub24oXCJtb3VzZW91dFwiLGZ1bmN0aW9uKCl7XG4gICAgXHRcdFx0c3ZnMS5zZWxlY3RBbGwoXCJjaXJjbGVcIilcbiAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwiYmxhY2tcIilcbiAgICBcdFx0XHRcdC5hdHRyKFwiclwiLCA1KVxuICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDIpO1xuICAgICAgICAgIHN2ZzIuc2VsZWN0KFwiLnRvb2x0aXBcIikucmVtb3ZlKCk7XG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJzdHJva2VcIixcInBpbmtcIikuYXR0cihcInN0cm9rZS13aWR0aFwiLDAuMik7XG5cbiAgICAgICAgfSlcblxuXG4gIHZhciBsZWdlbmQgPSBzdmcyLnNlbGVjdEFsbChcIi5sZWdlbmRcIilcbiAgICAgIC5kYXRhKGNvbG9yLmRvbWFpbigpLnNsaWNlKCkucmV2ZXJzZSgpKVxuICAgIC5lbnRlcigpLmFwcGVuZChcImdcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgbGVnZW5kQ2xhc3NBcnJheS5wdXNoKGQucmVwbGFjZSgvXFxzL2csICcnKSk7IC8vcmVtb3ZlIHNwYWNlc1xuICAgICAgICBsZWdlbmRDbGFzc0FycmF5X29yaWcucHVzaChkKTsgLy9yZW1vdmUgc3BhY2VzXG4gICAgICAgIHJldHVybiBcImxlZ2VuZFwiO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQsIGkpIHsgcmV0dXJuIFwidHJhbnNsYXRlKDAsXCIgKyBpICogMjAgKyBcIilcIjsgfSk7XG5cbiAgLy9yZXZlcnNlIG9yZGVyIHRvIG1hdGNoIG9yZGVyIGluIHdoaWNoIGJhcnMgYXJlIHN0YWNrZWRcbiAgbGVnZW5kQ2xhc3NBcnJheSA9IGxlZ2VuZENsYXNzQXJyYXkucmV2ZXJzZSgpO1xuICBsZWdlbmRDbGFzc0FycmF5X29yaWcgPSBsZWdlbmRDbGFzc0FycmF5X29yaWcucmV2ZXJzZSgpO1xuXG4gIGxlZ2VuZC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcInhcIiwgd2lkdGggLSAxOClcbiAgICAgIC5hdHRyKFwid2lkdGhcIiwgMTgpXG4gIFx0XHQuYXR0cihcImhlaWdodFwiLCAxOClcbiAgICAgIC5zdHlsZShcImZpbGxcIiwgY29sb3IpXG4gICAgICAuYXR0cihcImlkXCIsIGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgICAgIHJldHVybiBcImlkXCIgKyBkLnJlcGxhY2UoL1xccy9nLCAnJyk7XG4gICAgICB9KVxuICAgICAgLm9uKFwibW91c2VvdmVyXCIsZnVuY3Rpb24oKXtcblxuICAgICAgICBpZiAoYWN0aXZlX2xpbmsgPT09IFwiMFwiKSBkMy5zZWxlY3QodGhpcykuc3R5bGUoXCJjdXJzb3JcIiwgXCJwb2ludGVyXCIpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoYWN0aXZlX2xpbmsuc3BsaXQoXCJjbGFzc1wiKS5wb3AoKSA9PT0gdGhpcy5pZC5zcGxpdChcImlkXCIpLnBvcCgpKSB7XG4gICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuc3R5bGUoXCJjdXJzb3JcIiwgXCJwb2ludGVyXCIpO1xuICAgICAgICAgIH0gZWxzZSBkMy5zZWxlY3QodGhpcykuc3R5bGUoXCJjdXJzb3JcIiwgXCJhdXRvXCIpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLm9uKFwiY2xpY2tcIixmdW5jdGlvbihkKXtcblxuICAgICAgICBpZiAoYWN0aXZlX2xpbmsgPT09IFwiMFwiKSB7IC8vbm90aGluZyBzZWxlY3RlZCwgdHVybiBvbiB0aGlzIHNlbGVjdGlvblxuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgLnN0eWxlKFwic3Ryb2tlXCIsIFwiYmxhY2tcIilcbiAgICAgICAgICAgIC5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAyKTtcblxuICAgICAgICAgICAgYWN0aXZlX2xpbmsgPSB0aGlzLmlkLnNwbGl0KFwiaWRcIikucG9wKCk7XG4gICAgICAgICAgICBwbG90U2luZ2xlKHRoaXMpO1xuXHRcdFx0XHRcdFx0dmFyIHNvcnRCeSA9IDA7XG4gICAgICAgICAgICAvL2dyYXkgb3V0IHRoZSBvdGhlcnNcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZWdlbmRDbGFzc0FycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGlmIChsZWdlbmRDbGFzc0FycmF5W2ldICE9IGFjdGl2ZV9saW5rKSB7XG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KFwiI2lkXCIgKyBsZWdlbmRDbGFzc0FycmF5W2ldKVxuICAgICAgICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwLjUpO1xuICAgICAgICAgICAgICB9IGVsc2Ugc29ydEJ5ID0gaTsgLy9zYXZlIGluZGV4IGZvciBzb3J0aW5nIGluIGNoYW5nZSgpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vZW5hYmxlIHNvcnQgY2hlY2tib3hcbiAgICAgICAgICAgIGQzLnNlbGVjdChcImxhYmVsXCIpLnNlbGVjdChcImlucHV0XCIpLnByb3BlcnR5KFwiZGlzYWJsZWRcIiwgZmFsc2UpXG4gICAgICAgICAgICBkMy5zZWxlY3QoXCJsYWJlbFwiKS5zdHlsZShcImNvbG9yXCIsIFwiYmxhY2tcIilcbiAgICAgICAgICAgIC8vc29ydCB0aGUgYmFycyBpZiBjaGVja2JveCBpcyBjbGlja2VkXG4gICAgICAgICAgICBkMy5zZWxlY3QoXCIjc29ydFwiKS5vbihcImNoYW5nZVwiLCBjaGFuZ2UpO1xuXG4gICAgICAgIH0gZWxzZSB7IC8vZGVhY3RpdmF0ZVxuICAgICAgICAgIGlmIChhY3RpdmVfbGluayA9PT0gdGhpcy5pZC5zcGxpdChcImlkXCIpLnBvcCgpKSB7Ly9hY3RpdmUgc3F1YXJlIHNlbGVjdGVkOyB0dXJuIGl0IE9GRlxuICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgIC5zdHlsZShcInN0cm9rZVwiLCBcIm5vbmVcIik7XG5cbiAgICAgICAgICAgIC8vcmVzdG9yZSByZW1haW5pbmcgYm94ZXMgdG8gbm9ybWFsIG9wYWNpdHlcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVnZW5kQ2xhc3NBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdChcIiNpZFwiICsgbGVnZW5kQ2xhc3NBcnJheVtpXSlcbiAgICAgICAgICAgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgaWYgKGQzLnNlbGVjdChcImxhYmVsXCIpLnNlbGVjdChcImlucHV0XCIpLnByb3BlcnR5KFwiY2hlY2tlZFwiKSkge1xuICAgICAgICAgICAgICByZXN0b3JlWEZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2Rpc2FibGUgc29ydCBjaGVja2JveFxuICAgICAgICAgICAgZDMuc2VsZWN0KFwibGFiZWxcIilcbiAgICAgICAgICAgICAgLnN0eWxlKFwiY29sb3JcIiwgXCIjRDhEOEQ4XCIpXG4gICAgICAgICAgICAgIC5zZWxlY3QoXCJpbnB1dFwiKVxuICAgICAgICAgICAgICAucHJvcGVydHkoXCJkaXNhYmxlZFwiLCB0cnVlKVxuICAgICAgICAgICAgICAucHJvcGVydHkoXCJjaGVja2VkXCIsIGZhbHNlKTtcblxuXG4gICAgICAgICAgICAvL3NvcnQgYmFycyBiYWNrIHRvIG9yaWdpbmFsIHBvc2l0aW9ucyBpZiBuZWNlc3NhcnlcbiAgICAgICAgICAgIGNoYW5nZShzb3J0QnkpO1xuXG4gICAgICAgICAgICAvL3kgdHJhbnNsYXRlIHNlbGVjdGVkIGNhdGVnb3J5IGJhcnMgYmFjayB0byBvcmlnaW5hbCB5IHBvc25cbiAgICAgICAgICAgIHJlc3RvcmVQbG90KGQpO1xuXG4gICAgICAgICAgICBhY3RpdmVfbGluayA9IFwiMFwiOyAvL3Jlc2V0XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gLy9lbmQgYWN0aXZlX2xpbmsgY2hlY2tcblxuXG4gICAgICB9KTtcblxuICBsZWdlbmQuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgLmF0dHIoXCJ4XCIsIHdpZHRoIC0gMjQpXG4gICAgICAuYXR0cihcInlcIiwgOSlcbiAgICAgIC5hdHRyKFwiZHlcIiwgXCIuMzVlbVwiKVxuICAgICAgLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJlbmRcIilcbiAgXHRcdC5zdHlsZShcImZvbnQtd2VpZ2h0XCIsIFwiYm9sZFwiKVxuICAgICAgLnRleHQoZnVuY3Rpb24oZCkgeyByZXR1cm4gZDsgfSk7XG5cbiAgLy8gcmVzdG9yZSBncmFwaCBhZnRlciBhIHNpbmdsZSBzZWxlY3Rpb25cbiAgZnVuY3Rpb24gcmVzdG9yZVBsb3QoZCkge1xuICAgIC8vcmVzdG9yZSBncmFwaCBhZnRlciBhIHNpbmdsZSBzZWxlY3Rpb25cbiAgICBkMy5zZWxlY3RBbGwoXCIuYmFyczpub3QoLmNsYXNzXCIgKyBjbGFzc19rZWVwICsgXCIpXCIpXG4gICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbigxMDAwKVxuICAgICAgICAgIC5kZWxheShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChyZXN0b3JlWEZsYWcpIHJldHVybiAzMDAwO1xuICAgICAgICAgICAgZWxzZSByZXR1cm4gNzUwO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB4LnJhbmdlQmFuZCgpKSAvL3Jlc3RvcmUgYmFyIHdpZHRoXG4gICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKTtcblxuICAgIC8vdHJhbnNsYXRlIGJhcnMgYmFjayB1cCB0byBvcmlnaW5hbCB5LXBvc25cbiAgICBkMy5zZWxlY3RBbGwoXCIuY2xhc3NcIiArIGNsYXNzX2tlZXApXG4gICAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4geChkLm15c2Nob29sKTsgfSlcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbigxMDAwKVxuICAgICAgLmRlbGF5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHJlc3RvcmVYRmxhZykgcmV0dXJuIDIwMDA7IC8vYmFycyBoYXZlIHRvIGJlIHJlc3RvcmVkIHRvIG9yaWcgcG9zblxuICAgICAgICBlbHNlIHJldHVybiAwO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKFwieVwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIC8vcmV0dXJuIHkoZC55MSk7IC8vbm90IGV4YWN0bHkgY29ycmVjdCBzaW5jZSBub3QgYmFzZWQgb24gcmF3IGRhdGEgdmFsdWVcbiAgICAgICAgcmV0dXJuIGQueV9jb3JyZWN0ZWQ7XG4gICAgICB9KTtcblxuICAgIC8vcmVzZXRcbiAgICByZXN0b3JlWEZsYWcgPSBmYWxzZTtcblxuICB9XG5cbiAgLy8gcGxvdCBvbmx5IGEgc2luZ2xlIGxlZ2VuZCBzZWxlY3Rpb25cbiAgZnVuY3Rpb24gcGxvdFNpbmdsZShkKSB7XG5cbiAgICBjbGFzc19rZWVwID0gZC5pZC5zcGxpdChcImlkXCIpLnBvcCgpO1xuICAgIHZhciBpZHggPSBsZWdlbmRDbGFzc0FycmF5LmluZGV4T2YoY2xhc3Nfa2VlcCk7XG5cbiAgICAvL2VyYXNlIGFsbCBidXQgc2VsZWN0ZWQgYmFycyBieSBzZXR0aW5nIG9wYWNpdHkgdG8gMFxuICAgIGQzLnNlbGVjdEFsbChcIi5iYXJzOm5vdCguY2xhc3NcIiArIGNsYXNzX2tlZXAgKyBcIilcIilcbiAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmR1cmF0aW9uKDEwMDApXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAwKSAvLyB1c2UgYmVjYXVzZSBzdmcgaGFzIG5vIHppbmRleCB0byBoaWRlIGJhcnMgc28gY2FuJ3Qgc2VsZWN0IHZpc2libGUgYmFyIHVuZGVybmVhdGhcbiAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuXG4gICAgLy9sb3dlciB0aGUgYmFycyB0byBzdGFydCBvbiB4LWF4aXNcbiAgICBzY2hvb2wuc2VsZWN0QWxsKFwicmVjdFwiKS5lYWNoKGZ1bmN0aW9uIChkLCBpKSB7XG5cbiAgICAgIC8vZ2V0IGhlaWdodCBhbmQgeSBwb3NuIG9mIGJhc2UgYmFyIGFuZCBzZWxlY3RlZCBiYXJcbiAgICAgIGhfa2VlcCA9IGQzLnNlbGVjdChkW2lkeF0pLmF0dHIoXCJoZWlnaHRcIik7XG4gICAgICB5X2tlZXAgPSBkMy5zZWxlY3QoZFtpZHhdKS5hdHRyKFwieVwiKTtcblxuICAgICAgaF9iYXNlID0gZDMuc2VsZWN0KGRbMF0pLmF0dHIoXCJoZWlnaHRcIik7XG4gICAgICB5X2Jhc2UgPSBkMy5zZWxlY3QoZFswXSkuYXR0cihcInlcIik7XG5cbiAgICAgIGhfc2hpZnQgPSBoX2tlZXAgLSBoX2Jhc2U7XG4gICAgICB5X25ldyA9IHlfYmFzZSAtIGhfc2hpZnQ7XG5cbiAgICAgIC8vcmVwb3NpdGlvbiBzZWxlY3RlZCBiYXJzXG4gICAgICBkMy5zZWxlY3QoZFtpZHhdKVxuICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgIC5lYXNlKFwiYm91bmNlXCIpXG4gICAgICAgIC5kdXJhdGlvbigxMDAwKVxuICAgICAgICAuZGVsYXkoNzUwKVxuICAgICAgICAuYXR0cihcInlcIiwgeV9uZXcpO1xuXG4gICAgfSlcblxuICB9XG5cbiAgZnVuY3Rpb24gY2hhbmdlKHNvcnRCeSkge1xuXHRcdGQzLnNlbGVjdChcIiNzb3J0XCIpLmVhY2goZnVuY3Rpb24oZCkge1xuICAgIGlmIChkMy5zZWxlY3QodGhpcykucHJvcGVydHkoXCJjaGVja2VkXCIpKSBzb3J0RGVzY2VuZGluZyA9IHRydWU7XG4gICAgZWxzZSBzb3J0RGVzY2VuZGluZyA9IGZhbHNlO1xuICAgIH0pXG4gICAgdmFyIGNvbE5hbWUgPSBsZWdlbmRDbGFzc0FycmF5X29yaWdbc29ydEJ5XTtcblxuICAgIHZhciB4MCA9IHguZG9tYWluKGRhdGEuc29ydChzb3J0RGVzY2VuZGluZ1xuICAgICAgICA/IGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGJbY29sTmFtZV0gLSBhW2NvbE5hbWVdOyB9XG4gICAgICAgIDogZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYi50b3RhbCAtIGEudG90YWw7IH0pXG4gICAgICAgIC5tYXAoZnVuY3Rpb24oZCxpKSB7IHJldHVybiBkLlNjaG9vbDsgfSkpXG4gICAgICAgIC5jb3B5KCk7XG5cbiAgICBzY2hvb2wuc2VsZWN0QWxsKFwiLmNsYXNzXCIgKyBhY3RpdmVfbGluaylcbiAgICAgICAgIC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiB4MChhLm15c2Nob29sKSAtIHgwKGIubXlzY2hvb2wpO1xuICAgICAgICAgIH0pO1xuXG4gICAgdmFyIHRyYW5zaXRpb24gPSBzdmcyLnRyYW5zaXRpb24oKS5kdXJhdGlvbig3NTApLFxuICAgICAgICBkZWxheSA9IGZ1bmN0aW9uKGQsIGkpIHsgcmV0dXJuIGkgKiAyMDsgfTtcblxuICAgIC8vc29ydCBiYXJzXG4gICAgdHJhbnNpdGlvbi5zZWxlY3RBbGwoXCIuY2xhc3NcIiArIGFjdGl2ZV9saW5rKVxuICAgICAgLmRlbGF5KGRlbGF5KVxuICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIHgwKGQubXlzY2hvb2wpO1xuICAgICAgfSk7XG5cbiAgICAvL3NvcnQgeC1sYWJlbHMgYWNjb3JkaW5nbHlcbiAgICB0cmFuc2l0aW9uLnNlbGVjdChcIi54LmF4aXNcIilcbiAgICAgICAgLmNhbGwoeEF4aXMpXG4gICAgICAgIC5zZWxlY3RBbGwoXCJnXCIpXG4gICAgICAgIC5kZWxheShkZWxheSk7XG5cblxuICAgIHRyYW5zaXRpb24uc2VsZWN0KFwiLnguYXhpc1wiKVxuICAgICAgICAuY2FsbCh4QXhpcylcbiAgICAgIC5zZWxlY3RBbGwoXCJnXCIpXG4gICAgICAgIC5kZWxheShkZWxheSk7XG4gIH1cbn0pIl0sIm5hbWVzIjpbInNlbGVjdCIsImdlb0FsYmVyc1VzYSIsImdlb1BhdGgiLCJqc29uIiwiZmVhdHVyZSIsImNzdiJdLCJtYXBwaW5ncyI6Ijs7O0VBSUEsSUFBSSxRQUFRLENBQUM7RUFDYixJQUFJLFNBQVMsR0FBRywrREFBK0QsQ0FBQztBQUNoRjtFQUNBLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0VBQy9CLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztFQUNoQixHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDbkM7RUFDQSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztFQUMxQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztFQUM5QixFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztFQUMzQixFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztFQUMxQixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDO0VBQ25DLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FBQzdDO0VBQ0EsSUFBSSxHQUFHLEdBQUdBLFdBQU0sQ0FBQyxNQUFNLENBQUM7RUFDeEIsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDO0VBQ3BCLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUM7RUFDL0IsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNCO0VB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