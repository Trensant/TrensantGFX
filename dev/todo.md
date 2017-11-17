# TGW  (Trensant Graphics Wrapper) To Do list

Welcome to the TGW todo list.


## Release Items
* init() function for loading chart libs  
** allow init to be called after tgw called  
** allow "autoload-all" --> just load every chart lib for quick debugging  
** load indvidual libs  
** minify    
* naming --> TWiG ?  Trensant Wrapped integrated Graphics :)  


* Documentation  
** ~~how to set up charts  
** using charts offline   
** minimal examples  
** gallery   
** live code editor page  
*** live_edit.html .... support side by side via sideBySide=true  // can use boostrap with divs or hide divs  ~~

* Naming conventions across charts  -- these need to not conflicting
** onclick()    // d3 uses "click()"  
** onhover()  
** column titles for bar/line charts
** dynamic loading of data (e.g. treemap partial-loads the top layer, dynamically loads lower layers)  
** colors and weights  
** possible separation of native params from tgwParams to avoid conflicts  
*** perhaps use for options = { tgw: {}, native: {} }     // so tgw.onclick() is wrapped across all charts to have the same behavior.  

** add getURLParam() to tgw  

* Unit Testing
* Linting and clean up 
* Plotly

## Library Support  
* TGW native
** rowWordCloud
** prettyPrint
** boxGrid

* plotly  
** bar
** line
** scatter
** map
** pie

* google (from cdn)  
** bar
** line
** scatter
** map
** pie
** treemap

* d3  
** treemap
** zoomable sunburst
** wordcloud
** radial tree
** scatter
** map
** pie

* c3   
** bar
** line
** scatter
** map
** pie

* jqWordCloud  
** wordcloud
** timecloud (a tgw wrapper)

* wordcloud2.js
** wordcloud
** timecloud (a tgw wrapper)







