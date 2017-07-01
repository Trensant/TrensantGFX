/*  trensantGFX Functions
	see README.md
	
 	
	Contributors:
		M. A. Chatterjee <manu dot chatterjee at trensant dot com>
		Rye   Gongora    <rye  dot gongora  at trensant dot com>


	change log:
	M A Chatterjee 2017-05-08

	LICENSE: 
	
	(c) Moodwire Inc.  (dba) Trensant Inc

	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:

	* Redistributions of source code must retain the above copyright notice, this
	  list of conditions and the following disclaimer.

	* Redistributions in binary form must reproduce the above copyright notice,
	  this list of conditions and the following disclaimer in the documentation
	  and/or other materials provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
	FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
	DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
	CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
	OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


 */

(function (trensantGFX, undefined) {

//=====================================================================================================
/* 
	trensantGFX.typeOf (data) returns a useful type info for any object, including dates etc

	examples: 
		trensantGFX.typeOf(23)  // returns "number"
		trensantGFX.typeOf({})  // returns "object"
		trensantGFX.typeOf([])  // returns "array"
		trensantGFX.typeOf(new Date()) // returns "date"

*/
trensantGFX.typeOf = function (x)   {
	return (typeof x == "undefined") ? "undefined" : (({}).toString.call(x).match(/\s([a-zA-Z]+)/)[1].toLowerCase());
};

var _to = trensantGFX.typeOf;  //short hand used internally for typeof operations.

//=====================================================================================================
/* 
	trensantGFX.roundNum(x,numDigits)

	round a number to specified sig digits.	 default is 2
*/
trensantGFX.roundNum = function (x,numDigits) {
	numDigits =  (_to(numDigits) == 'number') ? Math.pow(10,Math.round( numDigits)) : 100;
	return Math.round (x*numDigits) / numDigits ;
}
var _round = trensantGFX.roundNum;  // short hand used internally

//=====================================================================================================
//constrain input x in between min, max, expects numeric input
trensantGFX.constrain = function (x,min,max) {
    if (max < min) {a=min; min=max; max=a;}
    if (x<=min)	{x=min;}
    if (x>=max)	{x=max;}
    return x;
}
//=====================================================================================================
/*
 Map an input value z in its natural range in0...in1 to the output 
 space out0...out1 with optional clipping
 exp_scale allows sigmoidal warping to stretch input values contrained to a small range. (floating point scale factor)

 example:
  	trensant.mapScaleEXP(33,0,100,-100,100)  --> maps 33 with input range from 0 .. 100 in to the range -100,100 linearly ==> 
 */
trensantGFX.mapScaleEXP = function (z, in0, in1, out0, out1, clip, exp_scale) {
    
    clip = (typeof clip == 'undefined')?false:clip;
    exp_scale = (typeof exp_scale !== 'number')?false:exp_scale;
    if (in0==in1) {return z;}
    if (exp_scale) {
        var y = ((z-((in1+in0) / 2.0))/(in1-in0))*exp_scale;
        z = ((out1-out0)*(1/(1+Math.exp(-y))))+out0;
    }
    else
        z = (((z-in0)/(in1-in0))*(out1-out0))+out0;
    if (clip!=false) 
        z=trensantGFX.constrain(z,out0,out1);
    return z;
}

var _mapScale = trensantGFX.mapScaleEXP; //short hand used internally


//======================================
/* 
	trensantGFX.containerDims(domID) 
	returns the height and width of a given HTML container 	
	currently uses Jquery but may change this later.  This fn is used internally for default container widths/heights
*/
trensantGFX.containerDims = function (domID) {
	return { "wid": $('#'+domID).width(), "hgt" : $('#'+domID).height()}
}

var _dims = trensantGFX.containerDims;


//=====================================================================================================
/* 	trensantGFX.setIntervalX(callbackFn, delayBtwCalls, repetitions)
 	set a javascript timer to only run a max of N repetions.  
	// Note: Only works in browser not server side as it requires access to window object.
	// also note that callback function is called with the interval number to be used for whatever purposes the callback likes
*/ 
trensantGFX.setIntervalX = function(callback, delay, repetitions) {
    var x = 0;
    var intervalID = window.setInterval(function () {

       callback(x);

       if (++x >= repetitions) {
           window.clearInterval(intervalID);
       }
    }, delay);
}
//=====================================================================================================
/*
	trensantGFX.repeatUntil()
	repeatUntil runs the supplied testFn every delay milliseconds up until a maxReps number of times.
	if the test function returns true it runs the successFn and stops the iterations.

	After the last rep has been completed the lastFn is called with (with the last testFn result and
	with the current iteration).  lastFn is optional.  failFn is optional
	
	Example:
	trensantGFX.repeatUntil(myLibsLoaded(), callMyChart(), null, 250, 10, null); // attempts to wait until mylib is loaded 10 times before giving up
	
*/ 
trensantGFX.repeatUntil = function(testFn, successFn, failFn, delay, maxReps, lastFn) {
	var _count = 0;
	var _max   = maxReps;
	if (typeof testFn != "function")
		return 'err';
	if (typeof delay != "number")
		delay = 250;  // 250ms
	if (typeof maxReps != "number")
		maxReps = 1; // run 1 time.

	var _testFn = testFn;
	var _successFn 	= (typeof successFn == "function") ? successFn 	: function(){};
	var _failFn 	= (typeof failFn 	== "function") ? failFn 	: function(){};
	var _lastFn 	= (typeof lastFn 	== "function") ? lastFn 	: function(){};

	var _f = function() {
		var success = _testFn();
		if (true== success) {
			_successFn();
			_lastFn(true,_count);

		}
		else {
			_failFn();
			if ( _count >= maxReps) {
				_lastFn(success, _count);
			}
			else {
				_count++;
				window.setTimeout(_f,delay)			
			}
		}

	}
	_f();


}
//=====================================================================================================
//=====================================================================================================
// BEGIN Graphics Wrapper Functions

//=====================================================================================================
//=====================================================================================================
/*
	trensantGFX.tgPrettyPrint (data, domID, opts) 
		prettyPrint a Javscript object 
		this is a "native" graphics call in that it doesn't wrap another charting library

	example usage:
		trensantGFX.tgPrettyPrint({"foo":123,"bar":345,"that":[1,2,3,4,5]}, "myDomId");
 */
trensantGFX.tgPrettyPrint = function (data, domID, opts) {        
	var i,h, json = data;

	var dopts = {	   		// default options
		"tag"   : "pre",  	// tag is the html element type to pretty print into
		"class" : "",     	// css class(es)  e.g. "class1 class2" to be applied to the whole container
		"style" : ""  		// style as line string e.g. "color:red; font-size:#fe1" to be applied to whole container
	};

	if (_to(opts) == "object")
		for (i in opts)
			dopts[i] = opts[i];

    var f = function (json) {
        json = JSON.stringify(json, undefined, 2);
        if (typeof json != 'string') {
             json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var sty = 'color:red';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    sty = 'color:blue';
                } else {
                    sty = 'color:green';
                }
            } else if (/true|false/.test(match)) {
                sty = 'magenta';
            } else if (/null/.test(match)) {
                sty = 'darkgrey';
            }
            return '<span style="' + sty + '">' + match + '</span>';
        });
    }
    var c = dopts["class"] == "" ? "" : ' class="'+dopts["class"]+'" ';
    var s = dopts["style"] == "" ? "" : ' style="'+dopts["style"]+'" ';
    h = "<"+dopts["tag"]+c+s+" >"+f(json)+"</"+dopts["tag"]+">";
    document.getElementById(domID).innerHTML = h;
	return document.getElementById(domID);
}

//=====================================================================================================
// drawRowWordCloudBase draws a word cloud with words in rows.  It is the base renderer.  see tgDrawRowWordCloud for direct calls
// words must be of form : [["word", value, optional-color, optional-id], [] ]
trensantGFX.tgDrawRowWordCloudBase = function(words,domID,opts) {
	var i, dopts = { 							// default options
		"maxSize" 	: 55,  						// any valid number for max font size 
		"minSize" 	: 9, 	  					// any valid number for min font size
		"sizeUnits" : "px",	 					// css units  for maxSize, minSize : px em % 
		"sort"    	: "none", 					// "up", "down", "alpha", "ralpha", "none"
		"spacer"    : "&nbsp; &nbsp;", 			// spacer to put bewteen words (string) -- can be "" or html
		"wclass"    : "",  						// optional style class for each word's span	
		"sortIgnore1stChars" : ['@','#','$'],  	//if a string begins with one of these ignore for purposes of sorting.
		"scale"		: 1.0,
		"onClick"   : function(){}				// not implemented yet
	};

	if (typeof opts == "object") {
		for (i in opts) {
			dopts[i] = opts[i];
		}
	}

	if (words.length <1 )
		return;
	var w = words.map(function(x){var c='inherit'; c = (typeof x[2] == "string") ?  x[2] :c ; return [x[0],x[1],c];});
	var max = w[0][1];	var min = w[0][1];

	for (i=0; i< w.length; i++) {
		max = ( w[i][1] > max ) ? w[i][1] : max; 
		min = ( w[i][1] < min ) ? w[i][1] : min;
	}
	if ((max-min)<2) {  // if all the words are the same size then we want to pick a place in the middle to make them not appear super tiny
		min--;
		max++;
	}

	var sort_fn = function (a,b){ return true}; // do nothing if default
	var _f = function(s) {return (dopts["sortIgnore1stChars"].indexOf(s[0]) == -1) ? s: s.substr(1,s.length);} // handle 1st character

	switch( dopts["sort"]) {
		case "alpha"  : sort_fn = function(a,b)  {return (_f(a[0])==_f(b[0])) ? 0 : (_f(a[0]) > _f(b[0])) ? 1 : -1;}; break;
		case "ralpha" : sort_fn = function(a,b)  {return (_f(a[0])==_f(b[0])) ? 0 : (_f(a[0]) < _f(b[0])) ? 1 : -1;}; break;
		case "up"     : sort_fn = function(a,b)  {return b[1] - a[1];}; break;
		case "down"   : sort_fn = function(a,b)  {return a[1] - b[1];}; break;
	}

	w.sort(sort_fn);

	var h = w.map(function(x){
			var cls = (dopts["wclass"] == "") ? "" : "class='" + dopts["wclass"]+"'";
			var a= "<span "+cls+"style='color:"+x[2]+"; font-size:"+_mapScale(x[1],min,max,dopts["minSize"],dopts["maxSize"],dopts["scale"])+dopts["sizeUnits"]+"'>"+x[0]+"</span>"; 
			return a;
		}).join(dopts["spacer"]);

	if (typeof domID == "string") {
		document.getElementById(domID).innerHTML=h; //attempt to render to supplied HTML eleme
		return document.getElementById(domID);
	}
	
	return h; // return HTML string if domID is not valid 
}

//=====================================================================================================
// drawRowWordCloudBase draws a word cloud with words in rows.  
// words must be of form : [["word", value, optional-color, optional-id], [] ]
trensantGFX.tgDrawRowWordCloud = function (words, domID, opts) {

	trensantGFX.tgDrawRowWordCloudBase( words,domID,opts);  // working version with bounds issues

    var n=9,m=20;
    var rs = $("#" +domID+ " > span")[0].getClientRects()[0];
    var re = $("#" +domID+ " > span")[$("#" +domID+ " > span").length-1].getClientRects()[0];
    var box = $("#"+domID)[0].getClientRects()[0];

    while (re.bottom <=  (box["bottom"]-(box["height"]*0.085))) { 
      rs = $("#" +domID+ " > span")[0].getClientRects()[0];
      re = $("#" +domID+ " > span")[$("#" +domID+ " > span").length-1].getClientRects()[0];
      gTemp = {"rs":rs, "re" :re};
      m+= 0.33;
      trensantGFX.tgDrawRowWordCloudBase( words,domID,opts);  // working version with bounds issues

      
      if (m > 100)
        break;
    }

    m-=0.67;
    trensantGFX.tgDrawRowWordCloudBase( words,domID,opts);  // working version with bounds issues

}


//=====================================================================================================
//=====================================================================================================
// Beging Google chart wrappers

//=====================================================================================================
/* gglChartsLoaded()   // function returns whether google chart functions have been loaded
	-- since google charts loads asynchornously its easy to have situations where data is available before
	the charts libs are (a race condition).  

 */
trensantGFX.gglChartsLoaded  = function() 
{
    if ((typeof google === 'undefined') || (typeof google.visualization === 'undefined') ) {

       return false;
    }
    else {
    	if (trensantGFX.typeOf(google.visualization.arrayToDataTable) != "function") 
    		return false;
    	if (trensantGFX.typeOf(google.visualization.PieChart) != "function")
    		return false;
    	if (trensantGFX.typeOf(google.visualization.LineChart) != "function")
    		return false;
    }
    return true;
}

//=====================================================================================================
/* gglDrawTable(data,cols,id,opts)

	draw sortable table using google charts.
	data = [
		[row1data, row2data, row3data],
		[row1data, row2data, row3data],
		..
		]

	cols must be array of types, labels e.g. 
		[ ["string", "this column label"], ["boolean", "another label"],	["number", "label for this colum"] ]

	id must be a valid unqiue HTML DOM id
	opts for google charts (see Google charts docs)
	
// example: gglDrawTable([['a',23,34],['b',23,12],['c',34,64]],[["string","labelx"],["number","this"],["number","that"]],"table-x");

*/

trensantGFX.gglDrawTable = function (data,cols,domID,opts) {
	if (typeof google.visualization.Table == "function") {
		var i;
		var dopts = {  // default options
			showRowNumber: true, 
			width: '80%', 
			height: 30*4 + 'px',
			allowHTML:true
		}
		if (_to(opts) == "object") // override default options
			for (i in opts)
				dopts[i]=opts[i];

		if(data == "")
			$("#"+domID).html("");
		else {
			var tdata = new google.visualization.DataTable();
			var x;

			for (x=0; x<cols.length; x++) // google charts table requires the column headers to be set up for sorting
				tdata.addColumn(cols[x][0],cols[x][1]);
					
			tdata.addRows(data);		
			var table = new google.visualization.Table(document.getElementById(domID));

				
			table.draw(tdata, dopts);
			return table;
		}
	}
	return false;
}


//=====================================================================================================
/*
  gglDrawPieChart(data,domID,opts)

  draw a pie chart using google charts.  

  coreLibrary: Google Charts

  this thin wrapper as it mostly calls gglCharts but keeps the API consistent with the other chart libs called.

  data must be of form:
  [["item1",value], ["item2", value], ["item3", value]]

 */
trensantGFX.gglDrawPieChart = function (data,domID,opts){

	if (typeof google.visualization.PieChart == "function") {
		var i;
		var cdata = google.visualization.arrayToDataTable(data); 
	    var dopts = {
	          titleTextStyle: {fontSize: 16},
	          height: "100%",
	          width: "100%",
	          chartArea: {  width: "75%", height: "75%" }
	          //legend: { position: 'none' }
	    };
	    if (typeof opts == 'object')
	        for (var i in opts)
	            dopts[i] = opts[i];

	    var cp = new google.visualization.PieChart(document.getElementById(domID),dopts);
	    cp.draw(cdata, dopts);		   
		return cp;
	}
	else
		return false; // couldn't access google visualizations (perhaps not loaded at all just or not loaded yet)

}

//=====================================================================================================
/*  gglDrawLineChart(data,domID,opts)

requires:
	google.load("visualization", "1", {packages:['corechart','table']});

data must be of this form:
  	[
  		['lablel for x axis','label for y1series','label for y2series',...],
   		[ 12,23,34,45],
   		[ 23,34,45,63],
  	]
*/
trensantGFX.gglDrawLineChart = function (data,domID,opts) {
    if (typeof google.visualization.LineChart == "function") {
	    var cdata = google.visualization.arrayToDataTable(data);
	    var dopts = { //default options
	      titleTextStyle: {fontSize: 16},
	      hAxis: {maxAlternation:2},
	      chartArea: {  width: "65%", height: "65%" }
	    };
	    
	    if ( _to(opts) == 'object')
	        for (var i in opts)
	            dopts[i] = opts[i];

	    var c2 = new google.visualization.LineChart(document.getElementById(domID));
		c2.draw(cdata, dopts);
		return c2; //return chart context..
	}
	return false;
}
//=====================================================================================================
/*	gglDrawBarChart

 */
trensantGFX.gglDrawBarChart = function(data,domID,options) {
	if (typeof google.visualization.BarChart == "function") {
	    var cdata = google.visualization.arrayToDataTable(data);
	    var doptions = {
	          titleTextStyle: {fontSize: 16},
	          hAxis: {maxAlternation:2},
	          bar: {groupWidth: '80%'},
	          height: data.length * 32,
	          width:  _dims(domID)["wid"]
	          //legend: { position: 'none' }
	    };
	    if (typeof options == 'object')
	        for (var i in options)
	            doptions[i] = options[i];

	    var cbar = new google.visualization.BarChart(document.getElementById(domID));
	    cbar.draw(cdata, doptions);
	    return cbar;
    }
    return false;
}

//=====================================================================================================
/*  gglDrawHistogram(data,domID,opts)
	draw a histogram (binned chart) using Google Charts.

    data must be a 2D array of this form 
	[['name','value-heading'],['foo',234],['bar',455]]
*/
trensantGFX.gglDrawHistogram = function (data,domID,options) {

    if (typeof google.visualization.Histogram == "function") {
	    var dopts = {

	          titleTextStyle: {fontSize: 16},
	          hAxis: {maxAlternation:2},
	          legend: { position: 'none' }
	          //histogram: { bucketSize: 1000 }
	    };
	    
	    var cdata = google.visualization.arrayToDataTable(data);

	    if (_to (opts) == 'object')
	        for (var i in opts)
	            dopts[i] = opts[i];

	    var ch = new google.visualization.Histogram(document.getElementById(domID));
	    ch.draw(cdata, dopts);
	    return ch;
	}
    return false;
}


//=================================================
// USAGE:
// abbrState('ny', 'name');
// --> 'New York'
// abbrState('New York', 'abbr');
// --> 'NY'

trensantGFX.abbrState = function (input, to){    
    var states = [
        ['Arizona', 'AZ'],
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    if (to == 'abbr'){
        input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        for(i = 0; i < states.length; i++){
            if(states[i][0] == input){
                return(states[i][1]);
            }
        }    
    } else if (to == 'name'){
        input = input.toUpperCase();
        for(i = 0; i < states.length; i++){
            if(states[i][1] == input){
                return(states[i][0]);
            }
        }    
    }
}


//======================================================================================================
  /*
   * Generates a Treemap.
   * REQUIRED: Declare an element with an id. The id is passed to parameter id.
    *  param: tree (dict)
      *  Schema:
        * { node: { child_name: "string",   child_id: "string",   children:   [ { child_name: "string",   parent_id: "string",   value: int, float, or double,   child_id: "string"   } ]   } }
    * param: id (string)
    * param: options (dict) A dictionary that allows you customize renderings and behaviors.
     *
       * Tree data options:
         * parentID:: type: string, default:
         * childID:: type: string, default:
         * childName:: type: string, default:
         * children:: type: string, default:
         * value:: type: string, default:
       * FURTHER DESCRIPTION for Tree data options:
         * Frequently trees contain different keys labels. For
         * example your tree label for children may be childs instead of children.
         * Normally in that case you would either change the all the keys in
         * you data prior to passing or specify a custom function in d3.hierarchy call.
         * Instead you can specify key lables in options.
         * Default values are parentID, childID, childName,
         * children, value.
         * Example: {children: childs}.
     *
       * Rendering Options:
         * svgWidth: type: int or function, default: 600
         * svgHeight:: type: int or function, default: 600
         * fader:: description: rectangle color, type: float, default 0.5
     *
       * Behavior Options:
         * rectangleBehavior:: type: dict of functions, default: null
         * rectangleBehaviorOptions: type: any, default: null
         * svgBehavior: type: dict of functions, default: null
         * svgBehaviorOptions: type: any, default: null
     *
  */
  trensantGFX.d3TreeMap = function (tree, id, options) {
    var treemapDefaultConfiguration = {
      parentID: 'parentID',
      childID: "childID",
      childName: "childName",
      children: "children",
      value: "value",
      svgWidth: 600,
      svgHeight: 600,
      fader: 0.5,
      rectangleBehavior: null,
      rectangleBehaviorOptions: null,
      svgBehavior: null,
      svgBehaviorOptions: null
    }
    configuration = setOptions(treemapDefaultConfiguration, options);

    var fader = function (color) {
        return d3.interpolateRgb(color, "#fff")(configuration.fader);
      },
      color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
      format = d3.format(",d");

    var width = typeof configuration.svgWidth === "function" ? configuration.svgWidth() : configuration.svgWidth,
      height = typeof configuration.svgHeight === "function" ? configuration.svgHeight() : configuration.svgHeight;

    d3.select('#'+id).append("p").classed("parent", true)
    d3.select('#'+id)
      .append("svg")
    var svg = d3.select('#'+id)
      .select("svg")
      .attr("width", width)
      .attr("height", height)
      .style("font", "10px sans-serif")
    if ("svgBehavior" in configuration) {
      for (var key in configuration.svgBehavior) {
        svg.on(key, function () {
          configuration.svgBehavior[key](configuration.svgBehaviorOptions);
        });
      }
    }


    var treemap = d3.treemap()
      .size([width, height])
      .round(true)
      .paddingInner(1);

    var nodeTree = tree;
    var root = d3.hierarchy(tree.node);
    root.eachBefore(function (d) {
      d.data.id = d.data[configuration.childID]
    })
      .sum(function (d) {
        return d[configuration.value]
      })
      .sort(function (a, b) {
        return b.value - a.value || b.value - a.value;
      });
    treemap(root);
    var parent_element = d3.select(".parent");
    parent_element.html(function () {
      return root.data[configuration.childName]
    });
    function drawit() {
      cell = svg.selectAll("g").data(root[configuration.children]).enter().append("g")
        .attr("transform", function (d) {
          return "translate(" + d.x0 + "," + d.y0 + ")";
        });

      cell.append("rect")
        .attr("id", function (d) {
          return d.data.id;
        })
        .attr("width", function (d) {
          return d.x1 - d.x0;
        })
        .attr("height", function (d) {
          return d.y1 - d.y0;
        })
        .attr("fill", function (d) {
          return color(d.data[configuration.value]);
        })
        .on('click', function (d) {
          redraw(d);
          parent_element.append("a")
            .attr("href", "javascript:void(0)")
            .html("  :  " + root.data.child_name)
            .on("click", function () {
              redraw_parent(root.data[configuration.parentID]);
            });
        });

      if (configuration && "rectangleBehavior" in configuration) {
        for (var key in configuration.rectangleBehavior) {
          cell.on(key, function (d) {
            configuration.rectangleBehavior[key](d, configuration.rectangleBehaviorOptions);
          });
        }
      }

      cell.append("clipPath")
        .attr("id", function (d) {
          return "clip-" + d.data.id;
        })
        .append("use")
        .attr("xlink:href", function (d) {
          return "#" + d.data.id;
        });

      cell.append("text")
        .attr("clip-path", function (d) {
          return "url(#clip-" + d.data.id + ")";
        })
        .selectAll("tspan")
        .data(function (d) {
          return d.data[configuration.childName].split(/(?=[A-Z][^A-Z])/g);
        })
        .enter().append("tspan")
        .attr("x", 4)
        .attr("y", function (d, i) {
          return 13 + i * 10;
        })
        .text(function (d) {
          return d;
        });

      cell.append("title")
        .text(function (d) {
          return d.data.id + "\n" + format(d.value);
        });
    }

    drawit();
    d3.selectAll("input")
      .data([sumBySize, sumByCount], function (d) {
        return d ? d.name : this.value;
      })
      .on("change", changed);

    var redraw = function (node) {

      if (node.children) {
        root = d3.hierarchy(node.data);
        root.eachBefore(function (d) {
          d.data.id = d.data[configuration.childID]
        })
          .sum(function (d) {
            return d[configuration.value]
          })
          .sort(function (a, b) {
            return b.value - a.value || b.value - a.value;
          });
        treemap(root);
        d3.selectAll('g').remove()
        drawit();
        addChildNode(nodeTree, node);
      }
    }
    var redraw_parent = function (id) {
      var mylen = d3.selectAll("a")._groups[0].length;
      var tickLabels = d3.selectAll("a").filter(function (d, i) {
        if (mylen == 1) {
          return 1;
        }
        else {
          for (i < mylen; i++;) {
            if (i == mylen) {
              return i
            }
          }
        }
      }).remove();
//      tickLabels.last().attr("color", "red");

      if (typeof(id) != 'undefined') {
        root = get_node(nodeTree, id);
        root = d3.hierarchy(root);
        root.eachBefore(function (d) {
          d.data.id = d.data[configuration.childID]
        })
          .sum(function (d) {
            return d[configuration.value]
          })
          .sort(function (a, b) {
            return b.value - a.value || b.value - a.value;
          });
        treemap(root);
        d3.selectAll('g').remove()
        drawit();
      }
    }

    function changed(sum, index, group) {
      //treemap(root.sum(sum)) passes the sum function to root.sum
      treemap(root.sum(sum));
      cell.transition()
        .duration(150)
        .attr("transform", function (d) {
          return "translate(" + d.x0 + "," + d.y0 + ")";
        })
        .select("rect")
        .attr("width", function (d) {
          return d.x1 - d.x0;
        })
        .attr("height", function (d) {
          return d.y1 - d.y0;
        });
    }

    function sumByCount(d) {
      return d.children ? 0 : 1;
    }

    function sumBySize(d) {
      return d.child_buzz;
    }

    function addChildNode(nodeTree, d3node) {
      child_id = d3node.data.child_id;
      parent_id = d3node.data.parent_id;
      if (nodeTree.node.child_id == parent_id) {
        if ('children' in nodeTree) {
          for (var node in nodeTree.children) {
            if (nodeTree.children[node].node == d3node.data) {
              continue;
            }
            else {
              nodeTree.children.push({node: d3node.data})
            }
          }
        }
        else {
          nodeTree.children = [];
          nodeTree.children.push({node: d3node.data});
        }
      }
      else {
        for (var node in nodeTree.children) {
          addChildNode(nodeTree.children[node], d3node);
        }
      }
    }

    function get_node(nodeTree, id) {
      if (nodeTree.node.child_id == id) {
        return nodeTree.node;
      }
      else {
        for (var node in nodeTree.children) {
          root = get_node(nodeTree.children[node], id);

        }
      }
      return root;
    }

    function setOptions(default_configuration, options) {
      /*Options.tree_attribute_names: Gets keys from the tree. If not present sets default values.*/

      if (options) {
        for (var setting in options) {
          if (!(Object.keys(default_configuration).indexOf(setting) > -1)) {
            console.warn(setting + ' is not a default setting.')
          }
          default_configuration[setting] = options[setting];
        }
      }
      return default_configuration
    }
  }
//======================================================================================================

  /*d3 radialtree draws a redial zoomable graph of related items
  * param: treeData (dict)
    * Schema:
    	{ "name": "node display name",  "children": [ { "name" : ..., children [ "name" : 					...,  ]}]}
  * param: id (string)
  * param: options (dict) A dictionary that allows you customize renderings and behaviors.
  *
  	* Tree data options:
  	 	* name:: type: string, default: "name"
  	 	* children:: type: string, default: "children"
		* FURTHER DESCRIPTION for Tree data options:
	 		* Frequently trees contain different keys labels. For
	 		* example your tree label for children may be childs instead of children.
	 		* Normally in that case you would either change the all the keys in
	 		* you data prior to passing or specify a custom function in d3.hierarchy call.
	 		* Instead you can specify key lables in options.
		 	* Example: {children: childs}.
	 *
  *
	* Rendering Options:
	 	* svgWidth: type: int or function, default: 600
	 	* svgHeight:: type: int or function, default: 600
		*
	*
		*/
  trensantGFX.d3RadialTree = function (treeData, id, options) {
    var radialTreeDefaultConfiguration = {
      name: "name",
      children: "children",
      svgWidth: 900,
      svgHeight: 900,
			diameter: 600,
			duration: 750
    }
    configuration = setOptions(radialTreeDefaultConfiguration, options);
    if (typeof options == "undefined") {
      options = {};
    }

    var width = typeof configuration.svgWidth === "function" ? configuration.svgWidth() : configuration.svgWidth,
      height = typeof configuration.svgHeight === "function" ? configuration.svgHeight() : configuration.svgHeight;

    var diameter = configuration.diameter;
    var duration = configuration.duration;

    var nodes, links;
    var i = 0;

    var treeLayout = d3.tree().size([360, diameter/2]).separation(
    	function (a,b){return (a.parent == b.parent ? 1 : 2) / a.depth;}), root;

    var nodeSvg, linkSvg, nodeEnter, linkEnter;

    var svg = d3.select("#"+id).append("svg")
      .attr("width", width)
      .attr("height", height);
    var g = svg.append("g").attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2 + 90) + ")");

    root = d3.hierarchy(treeData, function (d) {return d[configuration.children] });
    root.each(function (d) {
      d.name = d.data[configuration.name]; //transferring name to a name variable
      d.id = i; //Assigning numerical Ids
      i += i;
    });

    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    // root.children.forEach(collapse);
    update(root);


    function update(source) {
      root = treeLayout(root);
      nodes = treeLayout(root).descendants();
      links = nodes.slice(1);
      var nodeUpdate;
      var nodeExit;

      // Normalize for fixed-depth.
      nodes.forEach(function (d) {
        d.y = d.depth * diameter/6;
      });
      nodeSvg = g.selectAll(".d3RadialTreeNode")
        .data(nodes, function (d) {
          return d.id || (d.id = ++i);
        });
      nodeSvg.exit().remove();

      var nodeEnter = nodeSvg.enter()
        .append("g")
        .attr("class", "d3RadialTreeNode")
        .attr("transform", function (d) {
          return "translate(" + project(d.x, d.y) + ")";
        });


      nodeEnter.append("circle")
        .attr("r", 5)
        .style("fill", color).on("click", click);

      nodeEnter.append("text")
        .attr("dy", ".31em")
        .attr("x", function (d) {
          return d.x < 180 === !d.children ? 6 : -6;
        })
        .style("text-anchor", function (d) {
          return d.x < 180 === !d.children ? "start" : "end";
        })
        .attr("transform", function (d) {
          return "rotate(" + (d.x < 180 ? d.x - 90 : d.x - 270 ) + ")";
        })
        .text(function (d) {
          if (d.parent) {
            return d[configuration.name];
          }
          else {
            return null
          }
        }).on(options && options.textClick ? options.textClick : "click", options.onClick)

      // Transition nodes to their new position.
      var nodeUpdate = nodeSvg.merge(nodeEnter).transition()
        .duration(duration)
        .attr("transform", function (d) {
          return "translate(" + project(d.x, d.y) + ")";
        });

      nodeSvg.select("circle")
        .style("fill", color);

      nodeUpdate.select("text")
        .style("fill-opacity", 1)
        .attr("transform", function (d) {
          return "rotate(" + (d.x < 180 ? d.x - 90 : d.x - 270 ) + ")";
        });

      // Transition exiting nodes to the parent's new position.
      var nodeExit = nodeSvg.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
          return "translate(" + source.y + "," + source.x + ")";
        }) //for the animation to either go off there itself or come to centre
        .remove();

      nodeExit.select("circle")
        .attr("r", 1e-6);

      nodeExit.select("text")
        .style("fill-opacity", 1e-6);

      nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });


      linkSvg = g.selectAll(".d3RadialTreelink")
        .data(links, function (link) {
          var id = link.id + '->' + link.parent.id;
          return id;
        });

      // Transition links to their new position.
      linkSvg.transition()
        .duration(duration);
      // .attr('d', connector);

      // Enter any new links at the parent's previous position.
      linkEnter = linkSvg.enter().insert('path', 'g')
        .attr("class", "d3RadialTreelink")
        .attr("d", function (d) {
          return "M" + project(d.x, d.y)
            + "C" + project(d.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, d.parent.y);
        });
      /*
       function (d) {
       var o = {x: source.x0, y: source.y0, parent: {x: source.x0, y: source.y0}};
       return connector(o);
       });*/


      // Transition links to their new position.
      linkSvg.merge(linkEnter).transition()
        .duration(duration)
        .attr("d", connector);


      // Transition exiting nodes to the parent's new position.
      linkSvg.exit().transition()
        .duration(duration)
        .attr("d", /*function (d) {
         var o = {x: source.x, y: source.y, parent: {x: source.x, y: source.y}};
         return connector(o);
         })*/function (d) {
          return "M" + project(d.x, d.y)
            + "C" + project(d.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, d.parent.y);
        })
        .remove();

      // Stash the old positions for transition.
    }

    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else if (d._children) {
        d.children = d._children;
        d._children = null;
      } else {
        return null;
      }
      update(d);
    }


    function color(d) {
      return d._children ? "#3182bd" // collapsed package
        : d.children ? "#c6dbef" // expanded package
          : "#fd8d3c"; // leaf node
    }


    function flatten(root) {
      // hierarchical data to flat data for force layout
      var nodes = [];

      function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        else ++i;
        nodes.push(node);
      }

      recurse(root);
      return nodes;
    }


    function project(x, y) {
      var angle = (x - 90) / 180 * Math.PI, radius = y;
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }

    function connector(d) {
      return "M" + project(d.x, d.y)
        + "C" + project(d.x, (d.y + d.parent.y) / 2)
        + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
        + " " + project(d.parent.x, d.parent.y)
    }

    function setOptions(default_configuration, options) {
			/*Options.tree_attribute_names: Gets keys from the tree. If not present sets default values.*/

      if (options) {
        for (var setting in options) {
          if (!(Object.keys(default_configuration).indexOf(setting) > -1)) {
            console.warn(setting + ' is not a default setting.')
          }
          default_configuration[setting] = options[setting];
        }
      }
      return default_configuration
    }
  }

//  ====================================================================================================

	/*d3 chord draws a chord chart of related items
	 * param: data (dict)
	 	* data schema:
	 		* {matrix : [
	 			[0, 0, 1000, 1000],
	 			[0, 0, 1000, 1000],
			 	[1000, 1000, 0, 1000],
	 			[1000, 1000, 1000, 0]
	 			], groups: ["A", "B", "C", "D"]}
	 * param: id (string) Element to display chart.
	 * param: options (dict) A dictionary that allows you customize renderings and behaviors.
	 *
	 * Rendering Options:
	 * svgWidth: type: int or function, default: 600
	 * svgHeight:: type: int or function, default: 600
	 *
	 */
	trensantGFX.d3Chord = function(data, id, options) {
    var chordDefaultConfiguration = {
      svgWidth: 960,
      svgHeight: 960
    }
    configuration = setOptions(chordDefaultConfiguration, options);

    var width = typeof configuration.svgWidth === "function" ? configuration.svgWidth() : configuration.svgWidth,
      height = typeof configuration.svgHeight === "function" ? configuration.svgHeight() : configuration.svgHeight;

    function fade(opacity) {
      return function(d, i) {
        ribbons
          .filter(function(d) {
            return d.source.index != i && d.target.index != i;
          })
          .transition()
          .style("opacity", opacity);
      };
    }

    var svg = d3.select("#"+id)
				.append("svg")
				.attr("width", configuration.svgWidth)
				.attr("height", configuration.svgHeight),
      width = +svg.attr("width"),
      height = +svg.attr("height"),
      outerRadius = Math.min(width, height) * 0.5 - 65,
      innerRadius = outerRadius - 20;

    var chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    var ribbon = d3.ribbon()
      .radius(innerRadius);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var g = svg.append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .datum(chord(data.matrix));

    var group = g.append("g")
      .attr("class", "groups")
      .selectAll("g")
      .data(function(chords) { return chords.groups; })
      .enter().append("g");

    group.append("path")
      .style("fill", function(d) { return color(d.index); })
      .style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
      .attr("d", arc)
      .on("mouseover", fade(.1))         /* Where attempt at mouseover is made */
      .on("mouseout", fade(1))


    group.append("title").text(function(d) {
      return groupTip(d);
    });

    group.append("text")
      .attr("dy", ".35em")
      .attr("class", "d3ChordOfficeLabel")
      .attr("transform", function(d,i) {
        d.angle = (d.startAngle + d.endAngle) / 2;
        d.name = data.groups[i];
        return "rotate(" + (d.angle * 180 / Math.PI) + ")" +
          "translate(0," + -1.1 * (outerRadius + 10) + ")" +
          ((d.angle > Math.PI * 3 / 4 && d.angle < Math.PI * 5 / 4) ? "rotate(180)" : "");
      })
      .text(function(d) {
        return d.name;
      });

    var ribbons =   g.append("g")
      .attr("class", "d3ChordRibbons")
      .selectAll("path")
      .data(function(chords) { return chords; })
      .enter().append("path")
      .attr("d", ribbon)
      .style("fill", function(d) { return color(d.target.index); })
      .style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); });

    ribbons.append("title").
    text(function(d){return chordTip(d);});

    var groupTick = group.selectAll(".d3ChordGroupTick")
      .data(function(d) { return groupTicks(d, 1e3); })
      .enter().append("g")
      .attr("class", "group-tick")
      .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });

    groupTick.append("line")
      .attr("x2", 6);

    groupTick
      .filter(function(d) { return d.value % 2e3 === 0; })
      .append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
      .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .text(function(d) { return d.value; });

    function groupTicks(d, step) {
      var k = (d.endAngle - d.startAngle) / d.value;
      return d3.range(0, d.value, step).map(function(value) {
        return {value: value, angle: value * k + d.startAngle};
      });
    }

    function chordTip(d){
      var p = d3.format(".2%"), q = d3.formatPrefix("$,.2", 1e3)
      return "Flow Info:\n"
        + data.groups[d.source.index] + " → " + data.groups[d.target.index] + ": " + q(d.target.value) + "\n"
        + data.groups[d.target.index] + " → " + data.groups[d.source.index] + ": " + q(d.source.value);
    }

    function groupTip(d) {
      var q = d3.formatPrefix("$,.2", 1e3)
      return "Total Managed by " + data.groups[d.index] + ":\n" + q(d.value)
    }

    function setOptions(default_configuration, options) {
			/*Options.tree_attribute_names: Gets keys from the tree. If not present sets default values.*/

      if (options) {
        for (var setting in options) {
          if (!(Object.keys(default_configuration).indexOf(setting) > -1)) {
            console.warn(setting + ' is not a default setting.')
          }
          default_configuration[setting] = options[setting];
        }
      }
      return default_configuration
    }

  }
//  =================================================================
	/*d3zoombaleSunburst draws a sunburst chart of hierarchically related items
	 * param: data (dict)
	 	* data schema:
	 	* {name: "string",
			 children: [
	 			{
	 			name: "string",
	 			children: [{name: "string", size: value}
	 			]}
	 * param: id (string) Element to display chart.
	 * param: options (dict) A dictionary that allows you customize renderings and behaviors.
	 *
	 * Rendering Options:
	 * svgWidth: type: int or function, default: 600
	 * svgHeight:: type: int or function, default: 600
	 *
	 */
	trensantGFX.d3ZoomableSunburst = function(data, id, options) {
    var zoomableSunburstDefaultConfiguration = {
      svgWidth: 960,
      svgHeight: 960
    }
    configuration = setOptions(zoomableSunburstDefaultConfiguration , options);

    var width = configuration.svgWidth,
      height = configuration.svgHeight,
      radius = (Math.min(width, height) / 2) - 10;

    var formatNumber = d3.format(",d");

    var x = d3.scaleLinear()
      .range([0, 2 * Math.PI]);

    var y = d3.scaleSqrt()
      .range([0, radius]);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var partition = d3.partition();

    var arc = d3.arc()
      .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
      .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
      .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
      .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

    var svg = d3.select("#"+id).append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

    root = d3.hierarchy(data);
      root.sum(function(d) { return d.size; });

      svg.selectAll("g")
        .data(partition(root).descendants())
        .enter().append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
        .on("click", click)
        .append("title")
        .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });

    function click(d) {
      svg.transition()
        .duration(750)
        .tween("scale", function() {
          var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
          return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
        })
        .selectAll("path")
        .attrTween("d", function(d) { return function() { return arc(d); }; });
    }

    d3.select(self.frameElement).style("height", height + "px");

    function setOptions(default_configuration, options) {
			/*Options.tree_attribute_names: Gets keys from the tree. If not present sets default values.*/

      if (options) {
        for (var setting in options) {
          if (!(Object.keys(default_configuration).indexOf(setting) > -1)) {
            console.warn(setting + ' is not a default setting.')
          }
          default_configuration[setting] = options[setting];
        }
      }
      return default_configuration
    }
	}
})(typeof trensantGFX === 'undefined'? this['trensantGFX']={}: hf);//(window.hf = window.hf || {});

