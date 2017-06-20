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
// drawRowWordCloud draws a word cloud with words in rows 
// words must be of form : [["word", value, optional-color, optional-id], [] ]
trensantGFX.drawRowWordCloud = function(words,domID,opts) {
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

})(typeof trensantGFX === 'undefined'? this['trensantGFX']={}: hf);//(window.hf = window.hf || {});

