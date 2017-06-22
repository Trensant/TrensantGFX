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

var _to = trensantGFX.typeOf;  //short hand used internally

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
/*
	trensantGFX.prettyPrint (data)
		pretty a Javscript object 
	
	example usage:
		trensantGFX.tgPrettyPrint({"foo":123,"bar":345,"that":[1,2,3,4,5]}, "myDomId");
 */
trensantGFX.tgPrettyPrint = function (json, domID, opts) {        
	var i,h;

	var dopts = {	   		// default options
		"tag"   : "pre",  	// tag is the html element type to pretty print into
		"class" : "",     	// css class(es)  e.g. "class1 class2"
		"style" : ""  		// style as line string e.g. "color:red; font-size:#fe1"
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
/* gglDrawTable(data,cols,id,opts)

	draw sortable table using google charts.
	data = [
		[row1data, row2data, row3data],
		[row1data, row2data, row3data],
		..
		]

	cols must be array of types, labels e.g. 
		[ ["string", "this column label"], ["boolean", "another label"],	["number", "label for this colum"] ]

	id must be a valid HTML DOM id
	style is a string to a HTML style set for google charts (see Google charts docs)
	
// example: gglDrawTable([['a',23,34],['b',23,12],['c',34,64]],[["string","labelx"],["number","this"],["number","that"]],"table-x");

*/

trensantGFX.gglDrawTable = function (data,cols,domID,opts) {
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

//=====================================================================================================
/*  gglDrawHistogram(data,domID,opts)

requires:
	google.load("visualization", "1", {packages:['corechart','table']});

data must be of this form:
  	[
  		['lablel for x axis','label for y1series','label for y2series',...],
   		[ 12,23,34,45],
   		[ 23,34,45,63],
  	]
*/
function gglDrawLineChart(data,domID,opts) {
    
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

//=====================================================================================================
/*  gglDrawHistogram(data,domID,opts)
	draw a histogram (binned chart) using Google Charts.

    data must be a 2D array of this form 
	[['name','value'],['foo',234],['bar',455]]
*/
function gglDrawHistogram(data,domID,options) {
    
    var dopts = {
          title: title,
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

//draw a horizontal bar chart
//
function gglDrawBarChart(data,title,domID,w,options) {
    w = argSafe(w,"number",900);
    var h = data.length *32;
    var cdata = google.visualization.arrayToDataTable(data);
    var doptions = {
          title: title,
          titleTextStyle: {fontSize: 16},
          hAxis: {maxAlternation:2},
          bar: {groupWidth: '80%'},
          height: h,
          width:w
          //legend: { position: 'none' }
    };
    if (typeof options == 'object')
        for (var i in options)
            doptions[i] = options[i];

    var cbar = new google.visualization.BarChart(document.getElementById(domID));
    cbar.draw(cdata, doptions);
    
    return cbar;
}

function gglDrawPieChart(data,title,domID,w,h,options){
    w = argSafe(w,"number",900);
    h = argSafe(h,"number",900);
    var cdata = google.visualization.arrayToDataTable(data);
    var doptions = {
          title: title,
          titleTextStyle: {fontSize: 16},
          hAxis: {maxAlternation:2},
          height:h,
          width:w,
          chartArea: {  width: "75%", height: "75%" }
          //legend: { position: 'none' }
    };
    if (typeof options == 'object')
        for (var i in options)
            doptions[i] = options[i];

    var cp = new google.visualization.PieChart(document.getElementById(domID));
    cp.draw(cdata, doptions);
    return cp;
}

//=====================================================================================================
// emit a simple HTML object as a string.  
// s = trensantGFX.html("div","this is my content","{width:30}","class1 class2") 
// ==> 
// now use:
// $("#myID").html(s) 
//or
// document.getElementById("myId").innerHTML = s;
//
trensantGFX.html = function(tag,body,sty,cls) {
	sty = (hf.typeOf(sty) == "undefined") ? "" : " style='" +sty+ "' ";
	cls = (hf.typeOf(cls) == "undefined") ? "" : " class='" +cls+ "' ";
	return "<" + tag +sty+cls+" >"+body+"</"+tag+">" ;
}


//=====================================================================================================
// drawRowWordCloudBase draws a word cloud with words in rows.  It is the base renderer.  see drawRowWordCloud for direct calls
// words must be of form : [["word", value, optional-color, optional-id], [] ]
trensantGFX.drawRowWordCloudBase = function(words,domID,opts) {
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
			var a= "<span "+cls+"style='color:"+x[2]+"; font-size:"+hf.mapScaleEXP(x[1],min,max,dopts["minSize"],dopts["maxSize"],dopts["scale"])+dopts["sizeUnits"]+"'>"+x[0]+"</span>"; 
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
trensantGFX.drawRowWordCloud = function (words, domID, opts) {

	trensantGFX.drawRowWordCloudBase( words,domID,opts);  // working version with bounds issues

    var n=9,m=20;
    var rs = $("#" +domID+ " > span")[0].getClientRects()[0];
    var re = $("#" +domID+ " > span")[$("#" +domID+ " > span").length-1].getClientRects()[0];
    var box = $("#"+domID)[0].getClientRects()[0];

    while (re.bottom <=  (box["bottom"]-(box["height"]*0.085))) { 
      rs = $("#" +domID+ " > span")[0].getClientRects()[0];
      re = $("#" +domID+ " > span")[$("#" +domID+ " > span").length-1].getClientRects()[0];
      gTemp = {"rs":rs, "re" :re};
      m+= 0.33;
      trensantGFX.drawRowWordCloudBase( words,domID,opts);  // working version with bounds issues

      
      if (m > 100)
        break;
    }

    m-=0.67;
    trensantGFX.drawRowWordCloudBase( words,domID,opts);  // working version with bounds issues

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

//word cloud
//words must be of form [{text:"word",size:"23"},{text:"word2",size:45}, ... }]
//requires d3.js
trensantGFX.d3wordcloud = function (wwords,w,h,dom_id)
{	
    
    if (typeof wwords == "undefined") {
        console.log("error in wc data");
        return;
    }
    if (wwords.length < 2) {
        console.log("word cloud data no-length");
        return; //
    }
    var wmin = wwords[0]["size"];
    var wmax = wmin;
    console.log(wwords);
    for (var w=1; w<wwords.length; w++) {
        ws = wwords[w]["size"];
        wmin = (wmin<ws)?wmin:ws;
        wmax = (wmax>ws)?wmax:ws;
       // console.log(ws);
    }
    console.log("wm :" + wmin+":"+wmax);
    for (var w=0; w<wwords.length; w++) {
        //console.log(wwords[w]["size"]);
        wwords[w]["size"] = (mapScaleEXP(wwords[w]["size"],wmin,wmax,3,10));
        //console.log(wwords[w]["size"]);
    }
    
    var fill = d3.scale.category20b();
    var max,scale = 100;
    //console.log ("d3wordcloud:"+dom_id);
    d3.layout.cloud().size([w, h])
    .words( 
    ["Hello", "world", "normally", "you", "want", "more", "words",
    "than", "this","and","some","more","test","words","cause","this","is","so","much","fun","don't","you","think"]
    .map(function(d) { return {text: d, size: Math.random() * 100};} )
    //wwords        
    )
    .padding(5)
    //.rotate(function() { return ~~(Math.random() * 2) * 90; }) //allows words to rotate at funky angles
    .rotate(function() { return 0; }) //allows words to rotate at funky angles
    //.font("Impact")
    .fontSize(function(d) { return d.size; })
    .on("end", draw)
    .start();
    
    function draw(words) {
    d3.select("#"+dom_id ).append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate("+w/2+","+h/2+")") //center point
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
       // .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(function(d) { return d.text; });
    }	
}
//=====================================================================================================
//code to get entity info
//gettrensantGFXData("summary",{"entities":"53bf24780594e9a90cd03047,53bf11010594e9a90cd0303e"},console.log)

//code with entity fuzzy text search
//gettrensantGFXData("entity-lookup",{"prefix":"flip","type":"true","offset":9175040},console.log)

//======================================================================================================
  /*
   * param: tree (dict) The tree must in at least the following structure. So you must wrap into a dict
   * { node: { child_name: "string",
   child_id: "string",
   children:
   [ { child_name: "string",
   parent_id: "string",
   value: int, float, or double,
   child_id: "string"
   } ]
   } }
   * param: id (string)
   * param: options (dict) A dictionary that allows you customize renderings and behaviors.
   * Tree data options: parentID, childID, childName, children, value
   * Frequently trees contain different key values. So for
   * example if your tree uses the key childs instead of children you would normally have
   * to either change the all the keys in you data prior to passing or specify a custom
   * function in d3.hierarchy call.
   * Instead you can specify tree keys. Default values are parentID, childID, childName,
   * children, value. Example options dict with one options specified: {children: childs}.
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
   *  */
  trensantGFX.d3drawTreeMap = function (tree, id, options) {
    /*
     * param: tree (dict) The tree must in at least the following structure. So you must wrap into a dict
     * { node: { child_name: "string",
     child_id: "string",
     children:
     [ { child_name: "string",
     parent_id: "string",
     value: int, float, or double,
     child_id: "string"
     } ]
     } }
     * param: id (string)
     * param: options (dict) A dictionary that allows you customize renderings and behaviors.
     * Tree data options: parentID, childID, childName, children, value
     * Frequently trees contain different key values. So for
     * example if your tree uses the key childs instead of children you would normally have
     * to either change the all the keys in you data prior to passing or specify a custom
     * function in d3.hierarchy call.
     * Instead you can specify tree keys. Default values are parentID, childID, childName,
     * children, value. Example options dict with one options specified: {children: childs}.
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
     *  */
    configuration = setDefaultOptions(treemapConfiguration, options);

    var fader = function (color) {
        return d3.interpolateRgb(color, "#fff")(configuration.fader);
      },
      color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
      format = d3.format(",d");

    var width = typeof configuration.svgWidth === "function" ? configuration.svgWidth() : configuration.svgWidth,
      height = typeof configuration.svgHeight === "function" ? configuration.svgHeight() : configuration.svgHeight;

    d3.select(id).append("p").classed("parent", true)
    d3.select(id)
      .append("svg")
    var svg = d3.select(id)
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

    function setDefaultOptions(default_configuration, options) {
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

