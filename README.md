# TGW (multi-lib html chart library wrapper)

TGW (Trensant Graphics Wrapper) is a client-side javascript library for rendering charts.  It wraps components of different charting libraries with a common api and handles loading.

The charting library uses charts from several well known libraries, but normalizes their input as noted in the Chart Data section. Not all libraries are fully wrapped, meaning that the tgw libary provides wrappers only for the charts listed here, even if other charts exist in those libaries.   In some cases we wrap the same chart type from different sources.

To use a chart from a particular source family note the prefix (e.g. ggl or d3 etc)

## Usage

Being a client side rendering library trensantGFX only runs in a browser environment.  See the examples to sample charts and data sets.


```

<!-- load base chart libraries -->
<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script> <!-- load google charts -->
<script src="https://d3js.org/d3.v4.min.js"></script>  <!-- not compatible with d3.v3 or earlier  -->
<script type="text/javascript" src="./libs/wordcloud2.js"></script>
<script type="text/javascript" src="./libs/plotly.min.js"
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBwB-0FhqcR0eYbf4utsUNN02i8olM6ork" ></script>  <!-- google maps -->
<!--- end base lib load -->

<!-- load this library -->
<script type="text/javascript" src="./tgw.js"></script>      <!-- tgw is the main lib for all wrappers                                -->


<body>
<div id='myTreemap'> </div>
<div id='myPieChart'> </div>
<script>
	...
	//code to get tree data
	...
	trensantGFX.d3DrawTreeMap(treedata, domID); /// render a d3 treemap
	
	...
	//code to get pie data
	...
	trensantGFX.gglDrawPie(piedata,"myPieChartDiv", {... options go here are .... });
	

</script>

```



## Data and Packing

Charts take data either as a table (matrix) or as a structured tree.   See specific charts for required data types.  For charts which take a tree type structure the library provides some data packing functions which can be used to take a flat structure and convert it to the tree structure.

trensantGFX|lib|chartName (data, domID options);

for example:
trensantGFX.drawRowWordCloud(data,"myDiv",)


### Libaries Wrapped:
* Google charts
* D3.js (version 4) not compatible with V3
* jqwordcloud (relies on JQuery)
* trensantGFX (natively drawn chart)

All calls are prefixed with a prefix identifying the library name:

| Base Library | Prefix | Example                        |
|--------------|--------|--------------------------------|
| google       | ggl    | tgw.gglDrawPieChart()  		 |
| D3           | d3     | tgw.d3DrawTreeMap()    		 |
| trensant     | tg     | tgw.tgPrettyPrint()     		 |
| jqcloud      | jwc    | tgw.jqWordCloud()      		 |
| plotly       | pty    | tgw.ptyPieChart()		 		 |

The following charts are included trensantGFX:


| chart type 			| input-form  | source-libraries | notes                                |
|-----------------------|-------------|------------------|--------------------------------------|  
| prettyPrint           | json        | tgw      | prints any object as pretty printed  |
| rowWordCloud          | dict        | tgw      | creates a row-word cloud             |
| bar		 			| matrix	  | 				 |   |                                  
| line 		 			| matrix	  | google-charts    |   |
| pie  		  			| matrix      | google-charts    |   |
| word cloud 		 	| matrix  	  | jqcloud, D3 	 |   |
| magic quadrant    	| matrix      | tgw      |   |
| zoomable treemap 	    | tree        | D3               |   |
| zoomable sunburst     | tree        | D3               |   |
| basic treemap     	| matrix      | google-charts    |   |
| diverged stacked bar  | matrix  	  | 				 |   | 
| chord diagram			| sq matrix	  | D3               |   |
| scatter plot	    	| matrix      |                  |   |
| cloropleth	        | matrix      | D3               |   | 
| zoomable timeline     |             |                  |   |
| colorable geo map     |             |                  |   |




## loading libs and asynchronicity
The graphics charts libararies must be loaded before any calls can be made.  For some libaries, such as google charts callbacks are used to determine of the entire chart libaries are loaded before any rendering or data packing calls are allowed.  


## TODO
TrensantGFX hanldes insuring that all chart-libs are loaded before rendering calls are made and if they are not loaded will cache the data (in a closure) until the chart lib is avaliable.  
This frees the developer from maintaining library load states accross the various libaries.




## License
tgw.js is a licensed under the BSD 2-clause license.
See the accompanying License.txt file.

