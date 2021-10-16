# Geo-Salary-Data-Viz
This repository contains the source code for a webpage that visualizes the respective new graduate salaries of the top 30 US universities in a stacked bar chart, linked with a geo-map demonstrating the location of each university and the median wage of each US state.

### Views
##### Geo-Map
In the geo-map, spatial locality and color hue encode the location of each university and whether it is private, respectively.  Color luminance encodes the median wage of each US state. Users can interact with this view by clicking on the checkboxes on the top to hide the universities in which they are not interested. Also, if users hover over the circles representing different universities, a tooltip will pop up to provide basic information about the university.


![Alt text](/Files/GeoMap.png?raw=true)


##### Stacked Bar Chart
In the stacked bar chart, vertical position and color luminance encode salary data and percentile ranges, respectively. Users can hide the percentile ranges they are not interested in by clicking on any part of the color legend bar on the top right. If the same segment on the bar is clicked again, the effect of the first click will disappear. Users can also hover on any bar in the chart to get the exact number the bar represents from the popped-up tooltip.


![Alt text](/Files/StackedBarChart.png?raw=true)


##### How the Two Views Link
Hovering on any circle on the geo-map will highlight the stacked bar corresponding to the same university. Similarly, hovering on any bar in the bar chart will highlight the circle representing the same university on the geo-map. With the two views linked in this way, a user can quickly navigate the salary data based on the location of a university and, conversely, get to know the location of a university immediately when exploring its relevant salary data.


![Alt text](/Files/Interaction.png?raw=true)


### [Project Paper](https://github.com/kliu513/Geo-Salary-Data-Viz/blob/main/Files/Paper.pdf)
