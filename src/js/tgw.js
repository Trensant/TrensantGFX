/*  tgw Functions
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
$ = require('jquery');
var d3 = require('d3');
// c3 = require('c3');
var topojson = require('./libs/us-quantized-topo.js');
var Plotly = require('../../libs/plotly.min.js');
var d3legend = require('d3-svg-legend');

//=====================================================================================================
  /*
    tgw.typeOf (data) returns a useful type info for any object, including dates etc

    examples:
      tgw.typeOf(23)  // returns "number"
      tgw.typeOf({})  // returns "object"
      tgw.typeOf([])  // returns "array"
      tgw.typeOf(new Date()) // returns "date"

  */
var _to = function (x) {
  return (typeof x == "undefined") ? "undefined" : (({}).toString.call(x).match(/\s([a-zA-Z]+)/)[1].toLowerCase());
};

module.exports.typeOf = _to;
   // = module.exports.typeOf;  //short hand used internally for typeof operations.

//=====================================================================================================
  /*
    tgw.roundNum(x,numDigits)

    round a number to specified sig digits.	 default is 2
  */
var _round = function (x, numDigits) {
    numDigits = (_to(numDigits) == 'number') ? Math.pow(10, Math.round(numDigits)) : 100;
    return Math.round(x * numDigits) / numDigits;
  }
// = roundNum;  // short hand used internally

module.exports.roundNum = _round;

//=====================================================================================================
//constrain input x in between min, max, expects numeric input
module.exports.constrain = function (x, min, max) {
    if (max < min) {
      a = min;
      min = max;
      max = a;
    }
    if (x <= min) {
      x = min;
    }
    if (x >= max) {
      x = max;
    }
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
var _mapScale = function (z, in0, in1, out0, out1, clip, exp_scale) {

  clip = (typeof clip == 'undefined') ? false : clip;
  exp_scale = (typeof exp_scale !== 'number') ? false : exp_scale;
  if (in0 == in1) {
    return z;
  }
  if (exp_scale) {
    var y = ((z - ((in1 + in0) / 2.0)) / (in1 - in0)) * exp_scale;
    z = ((out1 - out0) * (1 / (1 + Math.exp(-y)))) + out0;
  }
  else
    z = (((z - in0) / (in1 - in0)) * (out1 - out0)) + out0;
  if (clip != false)
    z = tgw.constrain(z, out0, out1);
  return z;
}
module.exports.mapScaleEXP = _mapScale; //short hand used internally


//======================================
  /*
    tgw.containerDims(domID)
    returns the height and width of a given HTML container
    currently uses Jquery but may change this later.  This fn is used internally for default container widths/heights
  */
var _dims = function (domID) {
  return {"wid": $('#' + domID).width(), "hgt": $('#' + domID).height()}
}

module.exports.containerDims = _dims;


//=====================================================================================================
  /* 	tgw.setIntervalX(callbackFn, delayBtwCalls, repetitions)
     set a javascript timer to only run a max of N repetions.
    // Note: Only works in browser not server side as it requires access to window object.
    // also note that callback function is called with the interval number to be used for whatever purposes the callback likes
  */
module.exports.setIntervalX = function (callback, delay, repetitions) {
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
  tgw.repeatUntil()
  repeatUntil runs the supplied testFn every delay milliseconds up until a maxReps number of times.
  if the test function returns true it runs the successFn and stops the iterations.

  After the last rep has been completed the lastFn is called with (with the last testFn result and
  with the current iteration).  lastFn is optional.  failFn is optional

  Example:
  tgw.repeatUntil(myLibsLoaded(), callMyChart(), null, 250, 10, null); // attempts to wait until mylib is loaded 10 times before giving up

*/
module.exports.repeatUntil = function (testFn, successFn, failFn, delay, maxReps, lastFn) {
  var _count = 0;
  var _max = maxReps;
  if (typeof testFn != "function")
    return 'err';
  if (typeof delay != "number")
    delay = 250;  // 250ms
  if (typeof maxReps != "number")
    maxReps = 1; // run 1 time.

  var _testFn = testFn;
  var _successFn = (typeof successFn == "function") ? successFn : function () {
  };
  var _failFn = (typeof failFn == "function") ? failFn : function () {
  };
  var _lastFn = (typeof lastFn == "function") ? lastFn : function () {
  };

  var _f = function () {
    var success = _testFn();
    if (true == success) {
      _successFn();
      _lastFn(true, _count);

    }
    else {
      _failFn();
      if (_count >= maxReps) {
        _lastFn(success, _count);
      }
      else {
        _count++;
        window.setTimeout(_f, delay)
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
  tgw.tgPrettyPrint (data, domID, opts)
    prettyPrint a Javscript object
    this is a "native" graphics call in that it doesn't wrap another charting library

  example usage:
    tgw.tgPrettyPrint({"foo":123,"bar":345,"that":[1,2,3,4,5]}, "myDomId");
 */
module.exports.tgPrettyPrint = function (data, domID, opts) {
  var i, h, json = data;

  var dopts = {	   		// default options
    "tag": "pre",  	// tag is the html element type to pretty print into
    "class": "",     	// css class(es)  e.g. "class1 class2" to be applied to the whole container
    "style": "border:none"  		// style as line string e.g. "color:red; font-size:#fe1" to be applied to whole container
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
  var c = dopts["class"] == "" ? "" : ' class="' + dopts["class"] + '" ';
  var s = dopts["style"] == "" ? "" : ' style="' + dopts["style"] + '" ';
  h = "<" + dopts["tag"] + c + s + " >" + f(json) + "</" + dopts["tag"] + ">";
  document.getElementById(domID).innerHTML = h;
  return document.getElementById(domID);
}

//=====================================================================================================
// drawRowWordCloudBase draws a word cloud with words in rows.  It is the base renderer.  see tgDrawRowWordCloud for direct calls
// words must be of form : [["word", value, optional-color, optional-id], [] ]
module.exports.tgDrawRowWordCloudBase = function (words, domID, opts) {
  var i, dopts = { 							// default options
    "maxSize": 55,  						// any valid number for max font size
    "minSize": 9, 	  					// any valid number for min font size
    "sizeUnits": "px",	 					// css units  for maxSize, minSize : px em %
    "sort": "none", 					// "up", "down", "alpha", "ralpha", "none"
    "spacer": "&nbsp; &nbsp;", 			// spacer to put bewteen words (string) -- can be "" or html
    "wclass": "",  						// optional style class for each word's span
    "sortIgnore1stChars": ['@', '#', '$'],  	//if a string begins with one of these ignore for purposes of sorting.
    "scale": 1.0,
    "onClick": function () {
    }				// not implemented yet
  };

  if (typeof opts == "object") {
    for (i in opts) {
      dopts[i] = opts[i];
    }
  }

  if (words.length < 1)
    return;
  var w = words.map(function (x) {
    var c = 'inherit';
    c = (typeof x[2] == "string") ? x[2] : c;
    return [x[0], x[1], c];
  });
  var max = w[0][1];
  var min = w[0][1];

  for (i = 0; i < w.length; i++) {
    max = ( w[i][1] > max ) ? w[i][1] : max;
    min = ( w[i][1] < min ) ? w[i][1] : min;
  }
  if ((max - min) < 2) {  // if all the words are the same size then we want to pick a place in the middle to make them not appear super tiny
    min--;
    max++;
  }

  var sort_fn = function (a, b) {
    return true
  }; // do nothing if default
  var _f = function (s) {
    return (dopts["sortIgnore1stChars"].indexOf(s[0]) == -1) ? s : s.substr(1, s.length);
  } // handle 1st character

  switch (dopts["sort"]) {
    case "alpha"  :
      sort_fn = function (a, b) {
        return (_f(a[0]) == _f(b[0])) ? 0 : (_f(a[0]) > _f(b[0])) ? 1 : -1;
      };
      break;
    case "ralpha" :
      sort_fn = function (a, b) {
        return (_f(a[0]) == _f(b[0])) ? 0 : (_f(a[0]) < _f(b[0])) ? 1 : -1;
      };
      break;
    case "up"     :
      sort_fn = function (a, b) {
        return b[1] - a[1];
      };
      break;
    case "down"   :
      sort_fn = function (a, b) {
        return a[1] - b[1];
      };
      break;
  }

  w.sort(sort_fn);

  var h = w.map(function (x) {
    var cls = (dopts["wclass"] == "") ? "" : "class='" + dopts["wclass"] + "'";
    var a = "<span " + cls + "style='color:" + x[2] + "; font-size:" + _mapScale(x[1], min, max, dopts["minSize"], dopts["maxSize"], dopts["scale"]) + dopts["sizeUnits"] + "'>" + x[0] + "</span>";
    return a;
  }).join(dopts["spacer"]);

  if (typeof domID == "string") {
    document.getElementById(domID).innerHTML = h; //attempt to render to supplied HTML eleme
    return document.getElementById(domID);
  }

  return h; // return HTML string if domID is not valid
}

//=====================================================================================================
// drawRowWordCloudBase draws a word cloud with words in rows.
// words must be of form : [["word", value, optional-color, optional-id], [] ]
module.exports.tgDrawRowWordCloud = function (words, domID, opts) {

  module.exports.tgDrawRowWordCloudBase(words, domID, opts);  // working version with bounds issues

  var n = 9, m = 20;
  var rs = $("#" + domID + " > span")[0].getClientRects()[0];
  var re = $("#" + domID + " > span")[$("#" + domID + " > span").length - 1].getClientRects()[0];
  var box = $("#" + domID)[0].getClientRects()[0];

  while (re.bottom <= (box["bottom"] - (box["height"] * 0.085))) {
    rs = $("#" + domID + " > span")[0].getClientRects()[0];
    re = $("#" + domID + " > span")[$("#" + domID + " > span").length - 1].getClientRects()[0];
    gTemp = {"rs": rs, "re": re};
    m += 0.33;
    module.exports.tgDrawRowWordCloudBase(words, domID, opts);  // working version with bounds issues


    if (m > 100)
      break;
  }

  m -= 0.67;
  module.exports.tgDrawRowWordCloudBase(words, domID, opts);  // working version with bounds issues

}


//=====================================================================================================
//=====================================================================================================
// Beging Google chart wrappers

//=====================================================================================================
/* gglChartsLoaded()   // function returns whether google chart functions have been loaded
  -- since google charts loads asynchornously its easy to have situations where data is available before
  the charts libs are (a race condition).

 */
module.exports.gglChartsLoaded = function () {
  if ((typeof google === 'undefined') || (typeof google.visualization === 'undefined')) {

    return false;
  }
  else {
    if (tgw.typeOf(google.visualization.arrayToDataTable) != "function")
      return false;
    if (tgw.typeOf(google.visualization.PieChart) != "function")
      return false;
    if (tgw.typeOf(google.visualization.LineChart) != "function")
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

module.exports.gglDrawTable = function (data, cols, domID, opts) {
  if (typeof google.visualization.Table == "function") {
    var i;
    var dopts = {  // default options
      showRowNumber: true,
      width: '80%',
      height: 30 * 4 + 'px',
      allowHTML: true
    }
    if (_to(opts) == "object") // override default options
      for (i in opts)
        dopts[i] = opts[i];

    if (data == "")
      $("#" + domID).html("");
    else {
      var tdata = new google.visualization.DataTable();
      var x;

      for (x = 0; x < cols.length; x++) // google charts table requires the column headers to be set up for sorting
        tdata.addColumn(cols[x][0], cols[x][1]);

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
module.exports.gglDrawPieChart = function (data, domID, opts) {

  if (typeof google.visualization.PieChart == "function") {
    var i;
    var cdata = google.visualization.arrayToDataTable(data);
    var dopts = {
      titleTextStyle: {fontSize: 16},
      height: "100%",
      width: "100%",
      chartArea: {width: "75%", height: "75%"}
      //legend: { position: 'none' }
    };
    if (typeof opts == 'object')
      for (var i in opts)
        dopts[i] = opts[i];

    var cp = new google.visualization.PieChart(document.getElementById(domID), dopts);
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
module.exports.gglDrawLineChart = function (data, domID, opts) {
  if (typeof google.visualization.LineChart == "function") {
    var cdata = google.visualization.arrayToDataTable(data);
    var dopts = { //default options
      titleTextStyle: {fontSize: 16},
      hAxis: {maxAlternation: 2},
      chartArea: {width: "65%", height: "65%"}
    };

    if (_to(opts) == 'object')
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
module.exports.gglDrawBarChart = function (data, domID, options) {
  if (typeof google.visualization.BarChart == "function") {
    var cdata = google.visualization.arrayToDataTable(data);
    var doptions = {
      titleTextStyle: {fontSize: 16},
      hAxis: {maxAlternation: 2},
      bar: {groupWidth: '80%'},
      height: data.length * 32,
      width: _dims(domID)["wid"]
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
module.exports.gglDrawHistogram = function (data, domID, options) {

    if (typeof google.visualization.Histogram == "function") {
      var dopts = {

        titleTextStyle: {fontSize: 16},
        hAxis: {maxAlternation: 2},
        legend: {position: 'none'}
        //histogram: { bucketSize: 1000 }
      };

      var cdata = google.visualization.arrayToDataTable(data);

      if (_to(opts) == 'object')
        for (var i in opts)
          dopts[i] = opts[i];

      var ch = new google.visualization.Histogram(document.getElementById(domID));
      ch.draw(cdata, dopts);
      return ch;
    }
    return false;
  }


//======================================================================================================
module.exports.d3ChartsLoaded = function () {
  if (typeof d3 != "undefined")
    return true;
  return false;
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
module.exports.d3TreeMap = function (tree, id, options) {
  var treemapDefaultConfiguration = {
    parentID: 'parentID',
    childID: "childID",
    childName: "childName",
    children: "children",
    value: "value",
    svgWidth: tgw.containerDims(id).wid,
    svgHeight: tgw.containerDims(id).hgt,
    fader: 0.5,
    rectangleBehavior: null,
    rectangleBehaviorOptions: null,
    svgBehavior: null,
    svgBehaviorOptions: null
  }
  treeMapConfiguration = setOptions(treemapDefaultConfiguration, options);

  var fader = function (color) {
      return d3.interpolateRgb(color, "#fff")(treeMapConfiguration.fader);
    },
    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
    format = d3.format(",d");

  var width = typeof treeMapConfiguration.svgWidth === "function" ? treeMapConfiguration.svgWidth() : treeMapConfiguration.svgWidth,
    height = typeof treeMapConfiguration.svgHeight === "function" ? treeMapConfiguration.svgHeight() : treeMapConfiguration.svgHeight;

  d3.select('#' + id).append("p").classed("parent", true)
  d3.select('#' + id)
    .append("svg")
  var svg = d3.select('#' + id)
    .select("svg")
    .attr("width", width)
    .attr("height", height)
    .style("font", "10px sans-serif")
  if ("svgBehavior" in treeMapConfiguration) {
    for (var key in treeMapConfiguration.svgBehavior) {
      svg.on(key, function () {
        treeMapConfiguration.svgBehavior[key](treeMapConfiguration.svgBehaviorOptions);
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
    d.data.id = d.data[treeMapConfiguration.childID]
  })
    .sum(function (d) {
      return d[treeMapConfiguration.value]
    })
    .sort(function (a, b) {
      return b.value - a.value || b.value - a.value;
    });
  treemap(root);
  var parent_element = d3.select(".parent");
  parent_element.html(function () {
    return root.data[treeMapConfiguration.childName]
  });

  function drawit() {
    cell = svg.selectAll("g").data(root[treeMapConfiguration.children]).enter().append("g")
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
        return color(d.data[treeMapConfiguration.value]);
      })
      .on('click', function (d) {
        redraw(d);
        if (d.data[treeMapConfiguration.children]) {
          parent_element.append("a")
            .attr("href", "javascript:void(0)")
            .html("  :  " + root.data.child_name)
            .on("click", function () {
              redraw_parent(root.data[treeMapConfiguration.parentID]);
            });
        }
      });

    if (treeMapConfiguration && "rectangleBehavior" in treeMapConfiguration) {
      for (var key in treeMapConfiguration.rectangleBehavior) {
        cell.on(key, function (d) {
          treeMapConfiguration.rectangleBehavior[key](d, treeMapConfiguration.rectangleBehaviorOptions);
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
        return d.data[treeMapConfiguration.childName].split(/(?=[A-Z][^A-Z])/g);
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
        d.data.id = d.data[treeMapConfiguration.childID]
      })
        .sum(function (d) {
          return d[treeMapConfiguration.value]
        })
        .sort(function (a, b) {
          return b.value - a.value || b.value - a.value;
        });
      treemap(root);
      svg.selectAll('g').remove()
      drawit();
      addChildNode(nodeTree, node);
    }
  }

  var redraw_parent = function (id) {
    var mylen = d3.selectAll(".parent a")._groups[0].length;

    var tickLabels = d3.selectAll(".parent a").filter(function (d, i) {
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

    if (typeof(id) != 'undefined') {
      root = get_node(nodeTree, id);
      root = d3.hierarchy(root);
      root.eachBefore(function (d) {
        d.data.id = d.data[treeMapConfiguration.childID]
      })
        .sum(function (d) {
          return d[treeMapConfiguration.value]
        })
        .sort(function (a, b) {
          return b.value - a.value || b.value - a.value;
        });
      treemap(root);
      svg.selectAll('g').remove()
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
module.exports.d3RadialTree = function (treeData, id, options) {
  var radialTreeDefaultConfiguration = {
    name: "name",
    children: "children",
    svgWidth: tgw.containerDims(id).wid,
    svgHeight: tgw.containerDims(id).hgt,
    diameter: tgw.containerDims(id).wid / 2,
    duration: 750
  }
  radialTreeConfiguration = setOptions(radialTreeDefaultConfiguration, options);
  if (typeof options == "undefined") {
    options = {};
  }

  var width = typeof radialTreeConfiguration.svgWidth === "function" ? radialTreeConfiguration.svgWidth() : radialTreeConfiguration.svgWidth,
    height = typeof radialTreeConfiguration.svgHeight === "function" ? radialTreeConfiguration.svgHeight() : radialTreeConfiguration.svgHeight;

  var diameter = Math.min(width, height) * 0.9 - 75;
  var duration = radialTreeConfiguration.duration;

  var nodes, links;
  var i = 0;

  var treeLayout = d3.tree().size([360, diameter / 2]).separation(
    function (a, b) {
      return (a.parent == b.parent ? 1 : 2) / a.depth;
    }), root;

  var nodeSvg, linkSvg, nodeEnter, linkEnter;

  var svg = d3.select("#" + id).append("svg")
    .attr("width", width)
    .attr("height", height);
  var g = svg.append("g").attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

  root = d3.hierarchy(treeData, function (d) {
    return d[radialTreeConfiguration.children]
  });
  root.each(function (d) {
    d.name = d.data[radialTreeConfiguration.name]; //transferring name to a name variable
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
      d.y = d.depth * diameter / 6;
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
          return d[radialTreeConfiguration.name];
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
module.exports.d3Chord = function (data, id, options) {
  var chordDefaultConfiguration = {
    svgWidth: tgw.containerDims(id).wid,
    svgHeight: tgw.containerDims(id).hgt
  }
  chordConfiguration = setOptions(chordDefaultConfiguration, options);

  var width = typeof chordConfiguration.svgWidth === "function" ? chordConfiguration.svgWidth() : chordConfiguration.svgWidth,
    height = typeof chordConfiguration.svgHeight === "function" ? chordConfiguration.svgHeight() : chordConfiguration.svgHeight;

  function fade(opacity) {
    return function (d, i) {
      ribbons
        .filter(function (d) {
          return d.source.index != i && d.target.index != i;
        })
        .transition()
        .style("opacity", opacity);
    };
  }

  var svg = d3.select("#" + id)
      .append("svg")
      .attr("width", chordConfiguration.svgWidth)
      .attr("height", chordConfiguration.svgHeight),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    outerRadius = Math.min(width, height) * 0.5,
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
    .data(function (chords) {
      return chords.groups;
    })
    .enter().append("g");

  group.append("path")
    .style("fill", function (d) {
      return color(d.index);
    })
    .style("stroke", function (d) {
      return d3.rgb(color(d.index)).darker();
    })
    .attr("d", arc)
    .on("mouseover", fade(.1))         /* Where attempt at mouseover is made */
    .on("mouseout", fade(1))


  group.append("title").text(function (d) {
    return groupTip(d);
  });

  group.append("text")
    .attr("dy", ".35em")
    .attr("class", "d3ChordOfficeLabel")
    .attr("transform", function (d, i) {
      d.angle = (d.startAngle + d.endAngle) / 2;
      d.name = data.groups[i];
      return "rotate(" + (d.angle * 180 / Math.PI) + ")" +
        "translate(0," + -1.1 * (outerRadius + 10) + ")" +
        ((d.angle > Math.PI * 3 / 4 && d.angle < Math.PI * 5 / 4) ? "rotate(180)" : "");
    })
    .text(function (d) {
      return d.name;
    });

  var ribbons = g.append("g")
    .attr("class", "d3ChordRibbons")
    .selectAll("path")
    .data(function (chords) {
      return chords;
    })
    .enter().append("path")
    .attr("d", ribbon)
    .style("fill", function (d) {
      return color(d.target.index);
    })
    .style("stroke", function (d) {
      return d3.rgb(color(d.target.index)).darker();
    });

  ribbons.append("title").text(function (d) {
    return chordTip(d);
  });

  var groupTick = group.selectAll(".d3ChordGroupTick")
    .data(function (d) {
      return groupTicks(d, 1e3);
    })
    .enter().append("g")
    .attr("class", "group-tick")
    .attr("transform", function (d) {
      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)";
    });

  groupTick.append("line")
    .attr("x2", 6);

  groupTick
    .filter(function (d) {
      return d.value % 2e3 === 0;
    })
    .append("text")
    .attr("x", 8)
    .attr("dy", ".35em")
    .attr("transform", function (d) {
      return d.angle > Math.PI ? "rotate(180) translate(-16)" : null;
    })
    .style("text-anchor", function (d) {
      return d.angle > Math.PI ? "end" : null;
    })
    .text(function (d) {
      return d.value;
    });

  function groupTicks(d, step) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(function (value) {
      return {value: value, angle: value * k + d.startAngle};
    });
  }

  function chordTip(d) {
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
 * Tree data options:
   *
  * name:: type: string, default: "name"
  * children:: type: string, default: "children"
  * value:: type: string, default: "value"
   * FURTHER DESCRIPTION for Tree data options:
   * Frequently trees contain different keys labels. For
   * example your tree label for children may be childs instead of children.
   * Normally in that case you would either change the all the keys in
   * you data prior to passing or specify a custom function in d3.hierarchy call.
   * Instead you can specify key lables in options.
   * Example: {children: childs}.
 *
 * Rendering Options:
 * svgWidth:: type: int or function, default: 600
 * svgHeight:: type: int or function, default: 600
 *
 */
module.exports.d3ZoomableSunburst = function (data, id, options) {
  var zoomableSunburstDefaultConfiguration = {
    children: "children",
    value: "value",
    name: "name",
    svgWidth: tgw.containerDims(id).wid,
    svgHeight: tgw.containerDims(id).hgt
  }
  sunburstConfiguration = setOptions(zoomableSunburstDefaultConfiguration, options);

  var width = sunburstConfiguration.svgWidth,
    height = sunburstConfiguration.svgHeight,
    radius = (Math.min(width, height) / 2 - 10);

  var formatNumber = d3.format(",d");

  var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

  var y = d3.scaleSqrt()
    .range([0, radius]);

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var partition = d3.partition();

  var arc = d3.arc()
    .startAngle(function (d) {
      return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
    })
    .endAngle(function (d) {
      return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
    })
    .innerRadius(function (d) {
      return Math.max(0, y(d.y0));
    })
    .outerRadius(function (d) {
      return Math.max(0, y(d.y1));
    });

  var svg = d3.select("#" + id).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

  root = d3.hierarchy(data);
  root.sum(function (d) {
    return d[sunburstConfiguration.value];
  });

  svg.selectAll("g")
    .data(partition(root).descendants())
    .enter().append("path")
    .attr("d", arc)
    .style("fill", function (d) {
      return color((d.children ? d : d.parent).data[sunburstConfiguration.name]);
    })
    .on("click", click)
    .append("title")
    .text(function (d) {
      return d.data[sunburstConfiguration.name] + "\n" +
        formatNumber(d.value);
    });

  function click(d) {
    svg.transition()
      .duration(750)
      .tween("scale", function () {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
          yd = d3.interpolate(y.domain(), [d.y0, 1]),
          yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function (t) {
          x.domain(xd(t));
          y.domain(yd(t)).range(yr(t));
        };
      })
      .selectAll("path")
      .attrTween("d", function (d) {
        return function () {
          return arc(d);
        };
      });
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

//	========================================================================
/*d3Bubble draws a Bubble chart
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
 * Tree data options:
   * name:: type: string, default: "name"
   * children:: type: string, default: "children"
   * value:: type: string, default: "value"
   * FURTHER DESCRIPTION for Tree data options:
   * Frequently trees contain different keys labels. For
   * example your tree label for children may be childs instead of children.
   * Normally in that case you would either change the all the keys in
   * you data prior to passing or specify a custom function in d3.hierarchy call.
   * Instead you can specify key lables in options.
   * Example: {children: childs}.
 * Rendering Options:
   * svgWidth:: type: int or function, default: containerDims(id).wid
   * svgHeight:: type: int or function, default: containerDims(id).hgt
 *
 */
module.exports.d3Bubble = function (data, id, options) {
  var bubbleDefaultConfiguration = {
    children: "children",
    value: "value",
    id: "id",
    svgWidth: tgw.containerDims(id).wid,
    svgHeight: tgw.containerDims(id).hgt

  }

  var bubbleConfiguration = setOptions(bubbleDefaultConfiguration, options);

  var width = bubbleConfiguration.svgWidth,
    height = bubbleConfiguration.svgHeight;
  var svg = d3.select("#" + id).append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("text-anchor", "middle")
    .attr("font-size", 10);

  var format = d3.format(",d");

  var color = d3.scaleOrdinal(d3.schemeCategory20c);

  var pack = d3.pack()
    .size([width, height])
    .padding(1.5);

  var root = d3.hierarchy(data)
    .sum(function (d) {
      return d[bubbleConfiguration.value];
    })
    .each(function (d) {
      if (id = d.data[bubbleConfiguration.id]) {
        var id, i = id.lastIndexOf(".");
        d.id = id;
        d.package = id.slice(0, i);
        d.class = id.slice(i + 1);
      }
    });

  var node = svg.selectAll(".node")
    .data(pack(root).leaves())
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  node.append("circle")
    .attr("id", function (d) {
      return d.id;
    })
    .attr("r", function (d) {
      return d.r;
    })
    .style("fill", function (d) {
      return color(d.package);
    });

  node.append("clipPath")
    .attr("id", function (d) {
      return "clip-" + d.id;
    })
    .append("use")
    .attr("xlink:href", function (d) {
      return "#" + d.id;
    });

  node.append("text")
    .attr("clip-path", function (d) {
      return "url(#clip-" + d.id + ")";
    })
    .selectAll("tspan")
    .data(function (d) {
      return d.data[bubbleConfiguration.id].split(/(?=[A-Z][^A-Z])/g);
    })
    .enter().append("tspan")
    .attr("x", 0)
    .attr("y", function (d, i, nodes) {
      return 13 + (i - nodes.length / 2 - 0.5) * 10;
    })
    .text(function (d) {
      return d;
    });

  node.append("title")
    .text(function (d) {
      return d.id + "\n" + format(d[bubbleConfiguration.value]);
    });

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
//=========================================================================
/* wordcloud2.js  renders a wordcloud to a canvas using the WordCloud2.js library
*/
module.exports.wordCloud2js = function (data, div_id, opts) {

  var div = document.getElementById(div_id);

  var canvas = document.createElement("canvas");
  div.appendChild(canvas);
  canvas.height = div.offsetHeight;
  canvas.width = div.offsetWidth;
  var wlist = data.map(function (a) {
    return [a["word"], a["word"].length * 2.2 + 4/*a["frequency"]*/];
  }).sort(function (a, b) {
    return b[1] - a[1]
  }).splice(0, opts.maxWords);

  //console.log(wlist); //https://github.com/timdream/wordcloud2.js/blob/gh-pages/API.md
  opts = {
    "list": wlist,
    gridSize: Math.round(Math.log(30 + 5 - data.length) * canvas.width / 32),
    //weightFactor: function (size) {	return Math.pow(size, 2.3) * $('#word-tab').width() / 1024;},
    fontFamily: 'Lato',
    //color: function (word, weight) {return (weight === 12) ? '#f02222' : '#c09292';	},
    //rotateRatio: 0.5,
    //rotationSteps: 2,
    clearCanvas: true,
    maxWords: 30,
    origin: [canvas.width / 2, canvas.height / 3],
    backgroundColor: '#fff'
  }


  WordCloud(canvas, opts);//, clearCanvas: true,  );
  }
//=====================================================================================
  /* d3WordCloud renders a wordcloud to a canvas using the d3 library
  */
  module.exports.d3WordCloud = function (data, div_id, options) {
    // Word cloud layout by Jason Davies, https://www.jasondavies.com/wordcloud/
    // Algorithm due to Jonathan Feinberg, http://static.mrfeinberg.com/bv_ch03.pdf
    var dispatch = d3.dispatch;

    var cloudRadians = Math.PI / 180,
      cw = 1 << 11 >> 5,
      ch = 1 << 11;

    cloud = function () {
      var size = [256, 256],
        text = cloudText,
        font = cloudFont,
        fontSize = cloudFontSize,
        fontStyle = cloudFontNormal,
        fontWeight = cloudFontNormal,
        rotate = cloudRotate,
        padding = cloudPadding,
        spiral = archimedeanSpiral,
        words = [],
        timeInterval = Infinity,
        event = dispatch("word", "end"),
        timer = null,
        random = Math.random,
        cloud = {},
        canvas = cloudCanvas;

      cloud.canvas = function (_) {
        return arguments.length ? (canvas = functor(_), cloud) : canvas;
      };

      cloud.start = function () {
        var contextAndRatio = getContext(canvas()),
          board = zeroArray((size[0] >> 5) * size[1]),
          bounds = null,
          n = words.length,
          i = -1,
          tags = [],
          data = words.map(function (d, i) {
            d.text = text.call(this, d, i);
            d.font = font.call(this, d, i);
            d.style = fontStyle.call(this, d, i);
            d.weight = fontWeight.call(this, d, i);
            d.rotate = rotate.call(this, d, i);
            d.size = ~~fontSize.call(this, d, i);
            d.padding = padding.call(this, d, i);
            return d;
          }).sort(function (a, b) {
            return b.size - a.size;
          });

        if (timer) clearInterval(timer);
        timer = setInterval(step, 0);
        step();
        return cloud;

        function step() {
          var start = Date.now();
          while (Date.now() - start < timeInterval && ++i < n && timer) {
            var d = data[i];
            d.x = (size[0] * (random() + .5)) >> 1;
            d.y = (size[1] * (random() + .5)) >> 1;
            cloudSprite(contextAndRatio, d, data, i);
            if (d.hasText && place(board, d, bounds)) {
              tags.push(d);
              event.call("word", cloud, d);
              if (bounds) cloudBounds(bounds, d);
              else bounds = [{x: d.x + d.x0, y: d.y + d.y0}, {x: d.x + d.x1, y: d.y + d.y1}];
              // Temporary hack
              d.x -= size[0] >> 1;
              d.y -= size[1] >> 1;
            }
          }
          if (i >= n) {
            cloud.stop();
            event.call("end", cloud, tags, bounds);
          }
        }
      }

      cloud.stop = function () {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        return cloud;
      };

      function getContext(canvas) {
        canvas.width = canvas.height = 1;
        var ratio = Math.sqrt(canvas.getContext("2d").getImageData(0, 0, 1, 1).data.length >> 2);
        canvas.width = (cw << 5) / ratio;
        canvas.height = ch / ratio;

        var context = canvas.getContext("2d");
        context.fillStyle = context.strokeStyle = "red";
        context.textAlign = "center";

        return {context: context, ratio: ratio};
      }

      function place(board, tag, bounds) {
        var perimeter = [{x: 0, y: 0}, {x: size[0], y: size[1]}],
          startX = tag.x,
          startY = tag.y,
          maxDelta = Math.sqrt(size[0] * size[0] + size[1] * size[1]),
          s = spiral(size),
          dt = random() < .5 ? 1 : -1,
          t = -dt,
          dxdy,
          dx,
          dy;

        while (dxdy = s(t += dt)) {
          dx = ~~dxdy[0];
          dy = ~~dxdy[1];

          if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta) break;

          tag.x = startX + dx;
          tag.y = startY + dy;

          if (tag.x + tag.x0 < 0 || tag.y + tag.y0 < 0 ||
            tag.x + tag.x1 > size[0] || tag.y + tag.y1 > size[1]) continue;
          // TODO only check for collisions within current bounds.
          if (!bounds || !cloudCollide(tag, board, size[0])) {
            if (!bounds || collideRects(tag, bounds)) {
              var sprite = tag.sprite,
                w = tag.width >> 5,
                sw = size[0] >> 5,
                lx = tag.x - (w << 4),
                sx = lx & 0x7f,
                msx = 32 - sx,
                h = tag.y1 - tag.y0,
                x = (tag.y + tag.y0) * sw + (lx >> 5),
                last;
              for (var j = 0; j < h; j++) {
                last = 0;
                for (var i = 0; i <= w; i++) {
                  board[x + i] |= (last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
                }
                x += sw;
              }
              delete tag.sprite;
              return true;
            }
          }
        }
        return false;
      }

      cloud.timeInterval = function (_) {
        return arguments.length ? (timeInterval = _ == null ? Infinity : _, cloud) : timeInterval;
      };

      cloud.words = function (_) {
        return arguments.length ? (words = _, cloud) : words;
      };

      cloud.size = function (_) {
        return arguments.length ? (size = [+_[0], +_[1]], cloud) : size;
      };

      cloud.font = function (_) {
        return arguments.length ? (font = functor(_), cloud) : font;
      };

      cloud.fontStyle = function (_) {
        return arguments.length ? (fontStyle = functor(_), cloud) : fontStyle;
      };

      cloud.fontWeight = function (_) {
        return arguments.length ? (fontWeight = functor(_), cloud) : fontWeight;
      };

      cloud.rotate = function (_) {
        return arguments.length ? (rotate = functor(_), cloud) : rotate;
      };

      cloud.text = function (_) {
        return arguments.length ? (text = functor(_), cloud) : text;
      };

      cloud.spiral = function (_) {
        return arguments.length ? (spiral = spirals[_] || _, cloud) : spiral;
      };

      cloud.fontSize = function (_) {
        return arguments.length ? (fontSize = functor(_), cloud) : fontSize;
      };

      cloud.padding = function (_) {
        return arguments.length ? (padding = functor(_), cloud) : padding;
      };

      cloud.random = function (_) {
        return arguments.length ? (random = _, cloud) : random;
      };

      cloud.on = function () {
        var value = event.on.apply(event, arguments);
        return value === event ? cloud : value;
      };

      return cloud;
    };

    function cloudText(d) {
      return d.text;
    }

    function cloudFont() {
      return "serif";
    }

    function cloudFontNormal() {
      return "normal";
    }

    function cloudFontSize(d) {
      return Math.sqrt(d.value);
    }

    function cloudRotate() {
      return (~~(Math.random() * 6) - 3) * 30;
    }

    function cloudPadding() {
      return 1;
    }

    // Fetches a monochrome sprite bitmap for the specified text.
    // Load in batches for speed.
    function cloudSprite(contextAndRatio, d, data, di) {
      if (d.sprite) return;
      var c = contextAndRatio.context,
        ratio = contextAndRatio.ratio;

      c.clearRect(0, 0, (cw << 5) / ratio, ch / ratio);
      var x = 0,
        y = 0,
        maxh = 0,
        n = data.length;
      --di;
      while (++di < n) {
        d = data[di];
        c.save();
        c.font = d.style + " " + d.weight + " " + ~~((d.size + 1) / ratio) + "px " + d.font;
        var w = c.measureText(d.text + "m").width * ratio,
          h = d.size << 1;
        if (d.rotate) {
          var sr = Math.sin(d.rotate * cloudRadians),
            cr = Math.cos(d.rotate * cloudRadians),
            wcr = w * cr,
            wsr = w * sr,
            hcr = h * cr,
            hsr = h * sr;
          w = (Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f) >> 5 << 5;
          h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
        } else {
          w = (w + 0x1f) >> 5 << 5;
        }
        if (h > maxh) maxh = h;
        if (x + w >= (cw << 5)) {
          x = 0;
          y += maxh;
          maxh = 0;
        }
        if (y + h >= ch) break;
        c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
        if (d.rotate) c.rotate(d.rotate * cloudRadians);
        c.fillText(d.text, 0, 0);
        if (d.padding) c.lineWidth = 2 * d.padding, c.strokeText(d.text, 0, 0);
        c.restore();
        d.width = w;
        d.height = h;
        d.xoff = x;
        d.yoff = y;
        d.x1 = w >> 1;
        d.y1 = h >> 1;
        d.x0 = -d.x1;
        d.y0 = -d.y1;
        d.hasText = true;
        x += w;
      }
      var pixels = c.getImageData(0, 0, (cw << 5) / ratio, ch / ratio).data,
        sprite = [];
      while (--di >= 0) {
        d = data[di];
        if (!d.hasText) continue;
        var w = d.width,
          w32 = w >> 5,
          h = d.y1 - d.y0;
        // Zero the buffer
        for (var i = 0; i < h * w32; i++) sprite[i] = 0;
        x = d.xoff;
        if (x == null) return;
        y = d.yoff;
        var seen = 0,
          seenRow = -1;
        for (var j = 0; j < h; j++) {
          for (var i = 0; i < w; i++) {
            var k = w32 * j + (i >> 5),
              m = pixels[((y + j) * (cw << 5) + (x + i)) << 2] ? 1 << (31 - (i % 32)) : 0;
            sprite[k] |= m;
            seen |= m;
          }
          if (seen) seenRow = j;
          else {
            d.y0++;
            h--;
            j--;
            y++;
          }
        }
        d.y1 = d.y0 + seenRow;
        d.sprite = sprite.slice(0, (d.y1 - d.y0) * w32);
      }
    }

    // Use mask-based collision detection.
    function cloudCollide(tag, board, sw) {
      sw >>= 5;
      var sprite = tag.sprite,
        w = tag.width >> 5,
        lx = tag.x - (w << 4),
        sx = lx & 0x7f,
        msx = 32 - sx,
        h = tag.y1 - tag.y0,
        x = (tag.y + tag.y0) * sw + (lx >> 5),
        last;
      for (var j = 0; j < h; j++) {
        last = 0;
        for (var i = 0; i <= w; i++) {
          if (((last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0))
            & board[x + i]) return true;
        }
        x += sw;
      }
      return false;
    }

    function cloudBounds(bounds, d) {
      var b0 = bounds[0],
        b1 = bounds[1];
      if (d.x + d.x0 < b0.x) b0.x = d.x + d.x0;
      if (d.y + d.y0 < b0.y) b0.y = d.y + d.y0;
      if (d.x + d.x1 > b1.x) b1.x = d.x + d.x1;
      if (d.y + d.y1 > b1.y) b1.y = d.y + d.y1;
    }

    function collideRects(a, b) {
      return a.x + a.x1 > b[0].x && a.x + a.x0 < b[1].x && a.y + a.y1 > b[0].y && a.y + a.y0 < b[1].y;
    }

    function archimedeanSpiral(size) {
      var e = size[0] / size[1];
      return function (t) {
        return [e * (t *= .1) * Math.cos(t), t * Math.sin(t)];
      };
    }

    function rectangularSpiral(size) {
      var dy = 4,
        dx = dy * size[0] / size[1],
        x = 0,
        y = 0;
      return function (t) {
        var sign = t < 0 ? -1 : 1;
        // See triangular numbers: T_n = n * (n + 1) / 2.
        switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
          case 0:
            x += dx;
            break;
          case 1:
            y += dy;
            break;
          case 2:
            x -= dx;
            break;
          default:
            y -= dy;
            break;
        }
        return [x, y];
      };
    }

    // TODO reuse arrays?
    function zeroArray(n) {
      var a = [],
        i = -1;
      while (++i < n) a[i] = 0;
      return a;
    }

    function cloudCanvas() {
      return document.createElement("canvas");
    }

    function functor(d) {
      return typeof d === "function" ? d : function () {
        return d;
      };
    }

    var spirals = {
      archimedean: archimedeanSpiral,
      rectangular: rectangularSpiral
    };

//  ========================================================================
//  Implementation of the cloud visualization.
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

    var d3wordCloudDefaultConfiguration = {
      svgWidth: tgw.containerDims(div_id).wid,
      svgHeight: tgw.containerDims(div_id).hgt,
      font: "Impact",
      padding: 5,
      fontWeight: "normal"
    }

    var d3wordCloudConfiguration = setOptions(d3wordCloudDefaultConfiguration, options);

    var fill = d3.scaleOrdinal(d3.schemeCategory20);

    function draw(words) {
      d3.select("#" + div_id).append("svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function (d) {
          return d.size + "px";
        })
        .style("font-family", "Impact")
        .style("fill", function (d, i) {
          return fill(i);
        })
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) {
          return d.text;
        });
    }

    var layout = cloud()
      .size([d3wordCloudConfiguration.svgWidth, d3wordCloudConfiguration.svgHeight])
      .words(data.map(function (d) {
        return {text: d.value, size: d.count};
      }))
      .padding(d3wordCloudConfiguration.padding)
      // .rotate(function () {
      //   return ~~(Math.random() * 2) * 90;
      // })
      .font(d3wordCloudConfiguration.font)
      .fontSize(function (d) {
        return d.size;
      })
      .fontWeight(d3wordCloudConfiguration.fontWeight)
      .on("end", draw);
    if (options && "rotate" in options) {
      layout.rotate(options.rotate);
    }

    layout.start();
  }
//  =================================================================================
/* d3choropleth draws a choropleth chart.
* param: data (dict)   -- This chart type is unique in that it combines data that draws the polygons (frequently these are geographic objects such as a country or region) with the measurement data. We recommend that you follow this tutorial to construct the data for this chart. https://medium.com/@mbostock/command-line-cartography-part-1-897aa8f8ca2c
* param: id (string) Element to display chart.
* param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
  * choropleth data options:
      * name:: type: string, default: "name"
      * value:: type: string, default: "value"
      * FURTHER DESCRIPTION for choropleth data options: data options allows you to specify the data
        measurement key.
        Example: You are measuring density and your key value is "density". Usually you would either need to change the key in the data or update your visualization script. Here you can specify-> value: "density".
  * svgWidth:: type: int, default: container width
  * svgHeight:: type: int, default: container height
  * colorThresholds:: type: array of numbers, default: [50, 150, 350, 750, 1500]
    * This lets you set how many buckets you to create for your dataset.
  * colorScheme:: type: array, default: ["#adfcad", "#ffcb40", "#ffba00", "#ff7d73", "#ff4e40", "#ff1300"]
    * The number of colors in colorScheme. The length should be similar to colorThresholds.
  * legendOn:: type: bool default: false
  * legendOrientation:: type: string, default: 'vertical'
    * specify 'horizontal' to create a horizontal oriented legend
  * legendxPosition: type: int, default: 0
    * horizontally shift the legend
  *	legendyPosition: type: int, default: 0
    * vertically shift the legend
  *	legendDomain: type: [string]s, default: [10, 50, 150, 350, 750, 1500]
    * This provides the reference list for legendLabels.
  *	legendLabels: type: [float]s, default: ["< 50", "50+", "150+", "350+", "750+", "> 1500"]
    * rendered legend label values.
  */
module.exports.d3Choropleth = function (data, div_id, options) {
  var choroplethDefaultConfiguration = {
    value: "value",
    name: "name",
    svgWidth: tgw.containerDims(div_id).wid,
    svgHeight: tgw.containerDims(div_id).hgt,
    colorThresholds: [50, 150, 350, 750, 1500],
    colorScheme: ["#adfcad", "#ffcb40", "#ffba00", "#ff7d73", "#ff4e40", "#ff1300"],
    legendOn: false,
    legendOrientation: 'vertical',
    legendxPosition: 0,
    legendyPosition: 0,
    legendDomain: [10, 50, 150, 350, 750, 1500],
    legendLabels: ["< 50", "50+", "150+", "350+", "750+", "> 1500"]
  }
  var choroplethConfiguration = setOptions(choroplethDefaultConfiguration, options);

  var svg = d3.select("#" + div_id).append("svg"),
    width = choroplethConfiguration.svgWidth,
    height = choroplethConfiguration.svgHeight;

  svg.attr("width", width).attr("height", height)

  var path = d3.geoPath();

  var color = d3.scaleThreshold()
    .domain(choroplethConfiguration.colorThresholds)
    .range(choroplethConfiguration.colorScheme);

  var height_width = {
    height_min: 1000000000000,
    height_max: -1000000000000,
    width_min: 1000000000000,
    width_max: -1000000000000
  }
  var scaleFactors;
  ready(data)

  //==============================
  var ext_color_domain = choroplethConfiguration.legendDomain;
  var legend_labels = choroplethConfiguration.legendLabels;

  if (choroplethConfiguration.legendOn) {
    var legend = svg.selectAll("g.d3ChoroplethLegend")
      .data(ext_color_domain)
      .enter().append("g")
      .attr("transform", "translate(" + choroplethConfiguration.legendxPosition + "," + choroplethConfiguration.legendyPosition + ")")
      .attr("class", "d3ChoroplethLegend");

    var ls_w = 20, ls_h = 20;

    legend.append("rect")
      .attr("x", function (d, i) {
        if (choroplethConfiguration.legendOrientation == 'vertical') {
          return 20;
        }
        else {
          return i * ls_w
        }
      })
      .attr("y", function (d, i) {
        if (choroplethConfiguration.legendOrientation == 'vertical') {
          return i * ls_h
        }
        else {
          return 20;
        }
      })
      .attr("width", ls_w)
      .attr("height", ls_h)
      .style("fill", function (d, i) {
        return color(d);
      })
      .style("opacity", 0.8);

    legend.append("text")
      .attr("x", function (d, i) {
        if (choroplethConfiguration.legendOrientation == 'vertical') {
          return 50;
        }
        else {
          return null
        } //i*ls_w  }
      })
      .attr("y", function (d, i) {
        if (choroplethConfiguration.legendOrientation == 'vertical') {
          return i * ls_h + 15
        }
        else {
          return null;
        }
      })
      .attr("transform", function (d, i) {
        if (choroplethConfiguration.legendOrientation == 'vertical') return null;
        else {
          return "translate(" + i * ls_h + " 50)rotate(45 0 0)";
        }
      })
      .text(function (d, i) {
        return legend_labels[i];
      });
  }

  // ============================================
  function ready(us) {
    svg.append("g")
      .attr("class", "d3Counties")
      .selectAll("path")
      .data(
        function () {
          var _features = topojson.feature(us, us.objects.states).features
          for (var a in _features) {
            for (var b in _features[a].geometry.coordinates) {
              get_height_width(_features[a].geometry.coordinates[b]);
            }
          }
          scaleFactors = get_scale_factors(height_width);
          for (var a in _features) {
            for (var b in _features[a].geometry.coordinates) {
              scaleCoordinates(_features[a].geometry.coordinates[b], scaleFactors)
            }
          }
          return _features
        })
      .enter().append("path")
      .attr("fill", function (d) {
        d.name = d.properties[choroplethConfiguration.name];
        d.value = d.properties[choroplethConfiguration.value]
        return color(d.properties[choroplethConfiguration.value]);
      })
      .attr("d", path)
      .append("title")
      .text(function (d) {
        return d.name + "," + d.value;
      });
    svg.append("path")
      .datum(function () {
        var _mesh = topojson.mesh(us, us.objects.states, function (a, b) {
          return a !== b;
        })
        for (var a in _mesh.coordinates) {
          for (var b in _mesh.coordinates[a]) {
            scaleCoordinates(_mesh.coordinates[a][b], scaleFactors)
          }
        }
        return _mesh
      })
      .attr("class", "d3States")
      .attr("d", path);
  }

  function get_scale_factors(height_width) {
    scaleFactors = {};
    height_width.height = Math.round(height_width.height_max);
    height_width.width = Math.round(height_width.width_max);
    scaleFactors.height = height_width.height > height ? height / height_width.height : height_width.height / height;
    scaleFactors.width = height_width.width > width ? width / height_width.width : height_width.width / width;
    return scaleFactors;
  }

  function get_height_width(feat) {
    for (var b in feat) {
      if (typeof(feat[b]) == "number") {
        height_width.height_min = (feat[1] < height_width.height_min ? feat[1] : height_width.height_min)
        height_width.height_max = (feat[1] > height_width.height_max ? feat[1] : height_width.height_max)
        height_width.width_min = (feat[0] < height_width.width_min ? feat[0] : height_width.width_min)
        height_width.width_max = (feat[0] > height_width.width_max ? feat[0] : height_width.width_max)
      }
      else {
        get_height_width(feat[b])
      }
    }
  }

  function scaleCoordinates(feat, scaleFactors) {
    for (var b in feat) {
      if (typeof(feat[b]) == "number") {
        feat[0] = (feat[0] - height_width.width_min) * scaleFactors.width;
        feat[1] = (feat[1] - height_width.height_min) * scaleFactors.height;
        break
      }
      else {
        scaleCoordinates(feat[b], scaleFactors)
      }
    }
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
//==========================================================
module.exports.d3Radar = function (data, id, options) {
  /////////////////////////////////////////////////////////
  /////////////// The Radar Chart Function ////////////////
  /////////////// Written by Nadieh Bremer ////////////////
  ////////////////// VisualCinnamon.com ///////////////////
  //////////Updated for d3.js v4 by Ingo Kleiber //////////
  /////////// Inspired by the code of alangrafu ///////////
  /////////////////////////////////////////////////////////

  /*
  * param: data (dict) Schema [ { "key": "string", "values":[ { "reason":"string", "device":"string", "value":int}]}]
  * param: id (string) Element to display chart.
  * param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
    * w:: description: Width of the circle. type: int, default: container width, default: container width
    * h:: description: Height of the circle. type: int, default: container height, default: container height
    * margin:: description: The margins of the SVG., type: dict, default: {top: 20, right: 20, bottom: 20, left: 20}
    * levels:: description: How many levels or inner circles should there be drawn., type: int default: 3
    * maxValue:: description: What is the value that the biggest circle will represent., type: int, default: 0
    * labelFactor:: description: How much farther than the radius of the outer circle should the labels be placed., type: float, default: 1.25
    * wrapWidth:: description: The number of pixels after which a label needs to be given a new line., type: int, default: 60
    * opacityArea:: description: The opacity of the area of the blob.,  type: float, default: 0.35
    * dotRadius:: description: The size of the colored circles of each blog., type: int, default: 4
    * opacityCircles:: description: The opacity of the circles of each blob., type: float, default: 0.1
    * strokeWidth:: description: The width of the stroke around each blob., type: int, default: 2
    * roundStrokes:: description: If true the area and stroke will follow a round path (cardinal-closed)., type: bool, default: false
  */

  var cfg = {
    w: tgw.containerDims(id).wid,				//Width of the circle
    h: tgw.containerDims(id).hgt,				//Height of the circle
    margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
    legendPosition: {x: 20, y: 20}, // the position of the legend, from the top-left corner of the svg
    levels: 3,				//How many levels or inner circles should there be drawn
    maxValue: 0, 			//What is the value that the biggest circle will represent
    labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
    wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
    opacityArea: 0.35, 	//The opacity of the area of the blob
    dotRadius: 4, 			//The size of the colored circles of each blog
    opacityCircles: 0.1, 	//The opacity of the circles of each blob
    strokeWidth: 2, 		//The width of the stroke around each blob
    roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
    color: d3.schemeCategory10,	//Color function
    axisName: "reason",
    areaName: "device",
    value: "value",
    sortAreas: true
  };
  var copyCFGColor = JSON.parse(JSON.stringify(cfg.color));
  var legendColor = d3.scaleOrdinal().range(copyCFGColor.slice(0, data.length));
  var legendColorDomain = Array.apply(null, Array(data.length)).map(function (_, i) {
    return i;
  });
  legendColor.domain(legendColorDomain);
  cfg.color = d3.scaleOrdinal().range(cfg.color.slice(0, data.length));

  //Put all of the options into a variable called cfg
  if ('undefined' !== typeof options) {
    for (var i in options) {
      if ('undefined' !== typeof options[i]) {
        if (i == 'color') {
          copyCFGColor = JSON.parse(JSON.stringify(options[i]));
          legendColor = d3.scaleOrdinal().range(copyCFGColor.slice(0, data.length));
          legendColorDomain = Array.apply(null, Array(data.length)).map(function (_, i) {
            return i;
          });
          legendColor.domain(legendColorDomain);
          cfg[i] = d3.scaleOrdinal().range(options[i]);
        }
        else {
          cfg[i] = options[i];
        }
      }
    }//for i
  }//if
  //Map the fields specified in the configuration
  // to the axis and value variables


  var axisName = cfg["axisName"],
    areaName = cfg["areaName"],
    value = cfg["value"];

  //Calculate the average value for each area
  data.forEach(function (d) {
    d[value + "Average"] = d3.mean(d.values, function (e) {
      return e[value]
    });
  });

  //Sort the data for the areas from largest to smallest
  //by average value as an approximation of actual blob area
  //so that that the smallest area is drawn last
  //and therefore appears on top
  data = data.sort(function (a, b) {
    var a = a[value + "Average"],
      b = b[value + "Average"];
    return b - a;
  });

  //Convert the nested data passed in
  // into an array of values arrays
  data = data.map(function (d) {
    return d.values
  })


  //If the supplied maxValue is smaller than the actual one, replace by the max in the data
  var maxValue = Math.max(cfg.maxValue, d3.max(data, function (i) {
    return d3.max(i.map(function (o) {
      return o.value;
    }))
  }));

  var allAxis = (data[0].map(function (d, i) {
      return d[axisName]
    })),	//Names of each axis
    total = allAxis.length,					//The number of different axes
    radius = Math.min(cfg.w / 2, cfg.h / 2), 	//Radius of the outermost circle
    Format = d3.format('.0%'),			 	//Percentage formatting
    angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

  //Scale for the radius
  var rScale = d3.scaleLinear()
    .range([0, radius])
    .domain([0, maxValue]);

  /////////////////////////////////////////////////////////
  //////////// Create the container SVG and g /////////////
  /////////////////////////////////////////////////////////

  //Remove whatever chart with the same id/class was present before
  d3.select("#" + id).select("svg").remove();

  //Initiate the radar chart SVG
  var svg = d3.select("#" + id).append("svg")
    .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
    .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
    .attr("class", "radar" + id);
  //Append a g element
  var g = svg.append("g")
    .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

  /////////////////////////////////////////////////////////
  ////////// Glow filter for some extra pizzazz ///////////
  /////////////////////////////////////////////////////////

  //Filter for the outside glow
  var filter = g.append('defs').append('filter').attr('id', 'glow'),
    feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
    feMerge = filter.append('feMerge'),
    feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
    feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  /////////////////////////////////////////////////////////
  /////////////// Draw the Circular grid //////////////////
  /////////////////////////////////////////////////////////

  //Wrapper for the grid & axes
  var axisGrid = g.append("g").attr("class", "axisWrapper");

  //Draw the background circles
  axisGrid.selectAll(".levels")
    .data(d3.range(1, (cfg.levels + 1)).reverse())
    .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", function (d, i) {
      return radius / cfg.levels * d;
    })
    .style("fill", "#CDCDCD")
    .style("stroke", "#CDCDCD")
    .style("fill-opacity", cfg.opacityCircles)
    .style("filter", "url(#glow)");

  //Text indicating at what % each level is
  axisGrid.selectAll(".axisLabel")
    .data(d3.range(1, (cfg.levels + 1)).reverse())
    .enter().append("text")
    .attr("class", "axisLabel")
    .attr("x", 4)
    .attr("y", function (d) {
      return -d * radius / cfg.levels;
    })
    .attr("dy", "0.4em")
    .style("font-size", "10px")
    .attr("fill", "#737373")
    .text(function (d, i) {
      return Format(maxValue * d / cfg.levels);
    });

  /////////////////////////////////////////////////////////
  //////////////////// Draw the axes //////////////////////
  /////////////////////////////////////////////////////////

  //Create the straight lines radiating outward from the center
  var axis = axisGrid.selectAll(".axis")
    .data(allAxis)
    .enter()
    .append("g")
    .attr("class", "axis");
  //Append the lines
  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", function (d, i) {
      return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
    })
    .attr("y2", function (d, i) {
      return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
    })
    .attr("class", "line")
    .style("stroke", "white")
    .style("stroke-width", "2px");

  //Append the labels at each axis
  axis.append("text")
    .attr("class", "d3radarLegend")
    .style("font-size", "11px")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", function (d, i) {
      return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
    })
    .attr("y", function (d, i) {
      return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2);
    })
    .text(function (d) {
      return d
    })
    .call(wrap, cfg.wrapWidth);

  /////////////////////////////////////////////////////////
  ///////////// Draw the radar chart blobs ////////////////
  /////////////////////////////////////////////////////////

  //The radial line function
  var radarLine = d3.radialLine()
    .curve(d3.curveLinearClosed)
    .radius(function (d) {
      return rScale(d.value);
    })
    .angle(function (d, i) {
      return i * angleSlice;
    });

  if (cfg.roundStrokes) {
    radarLine.curve(d3.curveCardinalClosed);
  }

  //Create a wrapper for the blobs
  var blobWrapper = g.selectAll(".radarWrapper")
    .data(data)
    .enter().append("g")
    .attr("class", "radarWrapper");

  //Append the backgrounds
  blobWrapper
    .append("path")
    .attr("class", "radarArea")
    .attr("d", function (d, i) {
      return radarLine(d);
    })
    .style("fill", function (d, i) {
      return cfg.color(i);
    })
    .style("fill-opacity", cfg.opacityArea)
    .on('mouseover', function (d, i) {
      //Dim all blobs
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", 0.1);
      //Bring back the hovered over blob
      d3.select(this)
        .transition().duration(200)
        .style("fill-opacity", 0.7);
    })
    .on('mouseout', function () {
      //Bring back all blobs
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", cfg.opacityArea);
    });

  //Create the outlines
  blobWrapper.append("path")
    .attr("class", "radarStroke")
    .attr("d", function (d, i) {
      return radarLine(d);
    })
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke", function (d, i) {
      return cfg.color(i);
    })
    .style("fill", "none")
    .style("filter", "url(#glow)");

  //Append the circles
  blobWrapper.selectAll(".radarCircle")
    .data(function (d, i) {
      return d;
    })
    .enter().append("circle")
    .attr("class", "radarCircle")
    .attr("r", cfg.dotRadius)
    .attr("cx", function (d, i) {
      return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
    })
    .attr("cy", function (d, i) {
      return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
    })
    .style("fill", function (d, i, j) {
      return cfg.color(j);
    })
    .style("fill-opacity", 0.8);

  /////////////////////////////////////////////////////////
  //////// Append invisible circles for tooltip ///////////
  /////////////////////////////////////////////////////////

  //Wrapper for the invisible circles on top
  var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
    .data(data)
    .enter().append("g")
    .attr("class", "radarCircleWrapper");

  //Append a set of invisible circles on top for the mouseover pop-up
  blobCircleWrapper.selectAll(".radarInvisibleCircle")
    .data(function (d, i) {
      return d;
    })
    .enter().append("circle")
    .attr("class", "radarInvisibleCircle")
    .attr("r", cfg.dotRadius * 1.5)
    .attr("cx", function (d, i) {
      return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
    })
    .attr("cy", function (d, i) {
      return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
    })
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function (d, i) {
      newX = parseFloat(d3.select(this).attr('cx')) - 10;
      newY = parseFloat(d3.select(this).attr('cy')) - 10;

      tooltip
        .attr('x', newX)
        .attr('y', newY)
        .text(Format(d.value))
        .transition().duration(200)
        .style('opacity', 1);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200)
        .style("opacity", 0);
    });

  //Set up the small tooltip for when you hover over a circle
  var tooltip = g.append("text")
    .attr("class", "d3radartooltip")
    .style("opacity", 0);

  /////////////////////////////////////////////////////////
  /////////////////// Helper Function /////////////////////
  /////////////////////////////////////////////////////////

  //Taken from http://bl.ocks.org/mbostock/7555321
  //Wraps SVG text
  function wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4, // ems
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }//wrap

  // on mouseover for the legend symbol
  function cellover(d) {
    //Dim all blobs
    d3.selectAll(".radarArea")
      .transition().duration(200)
      .style("fill-opacity", 0.1);
    //Bring back the hovered over blob
    d3.select("." + data[d][0][areaName].replace(/\s+/g, ''))
      .transition().duration(200)
      .style("fill-opacity", 0.7);
  }

  // on mouseout for the legend symbol
  function cellout() {
    //Bring back all blobs
    d3.selectAll(".radarArea")
      .transition().duration(200)
      .style("fill-opacity", cfg.opacityArea);
  }

  /////////////////////////////////////////////////////////
  /////////////////// Draw the Legend /////////////////////
  /////////////////////////////////////////////////////////

  svg.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", "translate(" + cfg["legendPosition"]["x"] + "," + cfg["legendPosition"]["y"] + ")");
  var legendOrdinal = d3legend.legendColor()
  //d3 symbol creates a path-string, for example
  //"M0,-8.059274488676564L9.306048591020996,
  // //8.059274488676564 -9.306048591020996,8.059274488676564Z"
    .shape("circle")
    .shapePadding(10)
    .scale(legendColor)
    .labels(legendColor.domain().map(function (d) {
      return data[d][0][areaName];
    }))
    .on("cellover", function (d) {
      cellover(d);
    })
    .on("cellout", function (d) {
      cellout();
    });

  svg.select(".legendOrdinal")
    .call(legendOrdinal);
}

//   // =======================================================
//   tgw.c3 = function (chartConfig, div_id, options) {
//     chartConfig.bindto = "#" + div_id;
//     if (options) {
//       for (var key in options) {
//         if (key != 'data') {
//           chartConfig[key] = options[key]
//         }
//         else {
//           for (var key in options.data) {
//             chartConfig.data[key] = options.data[key]
//           }
//         }
//       }
//     }
//     c3.generate(chartConfig);
//   }
// =======================================================
/* plotlyLine draws a line chart using plotly library.
* param: data (array) [{x: [], y: []}]
* param: id (string) Element to display chart.
* param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
    config: (array) use plotly's documentation to fill in chart options.
      NOTE: The configuration array must be the same length and order as the data array.
      Example: [{mode: 'lines', name: 'Red', line: { color: 'rgb(219, 64, 82)', width: 3}}]
    layout: modify the chart layout
  */

module.exports.plotlyLine = function (data, div_id, options) {
  traceConfigurations = [];
  for (var d in data) {
    var traceConfig = {};
    traceConfig.x = data[d].x;
    traceConfig.y = data[d].y;
    traceConfig.type = 'scatter';
    if (options) {
      for (var o in options.config[d]) {
        traceConfig[o] = options.config[d][o]
      }
    }
    traceConfigurations.push(traceConfig);
  }
  Plotly.newPlot(div_id, traceConfigurations);
}
// =======================================================
/* plotlyScatter draws a scatter chart using plotly library.
* param: data (array) [{x: [], y: []}]
* param: id (string) Element to display chart.
* param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
    config: (array) use plotly's documentation to fill in chart options.
      NOTE: The configuration array must be the same length and order as the data array.
    layout: modify the chart layout
  */

module.exports.plotlyScatter = function (data, div_id, options) {
  traceConfigurations = [];
  for (var d in data) {
    var traceConfig = {};
    traceConfig.x = data[d].x;
    traceConfig.y = data[d].y;
    traceConfig.type = 'scatter';
    traceConfig.mode = 'markers';
    if (options) {
      for (var o in options.config[d]) {
        traceConfig[o] = options.config[d][o]
      }
    }
    traceConfigurations.push(traceConfig);

  }
  Plotly.newPlot(div_id, traceConfigurations);
}

// =======================================================
/* plotlyBar draws a bar chart using plotly library.
* param: data (array) [{x: [], y: []}]
* param: id (string) Element to display chart.
* param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
    config: (array) use plotly's documentation to fill in chart options.
      NOTE: The configuration array must be the same length and order as the data array.
    layout: modify the chart layout
  */

module.exports.plotlyBar = function (data, div_id, options) {
  traceConfigurations = [];
  for (var d in data) {
    var traceConfig = {};
    traceConfig.x = data[d].x;
    traceConfig.y = data[d].y;
    traceConfig.type = 'bar';
    if (options) {
      for (var o in options.config[d]) {
        traceConfig[o] = options.config[d][o]
      }
    }
    traceConfigurations.push(traceConfig);

  }
  Plotly.newPlot(div_id, traceConfigurations);
}

// =======================================================
/* plotlyStackBar	draws a Stacked Bar chart using plotly library.
* param: data (array) [{x: [], y: []}]
* param: id (string) Element to display chart.
* param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
    config: (array) use plotly's documentation to fill in chart options.
      NOTE: The configuration array must be the same length and order as the data array.
    layout: modify the chart layout
  */

module.exports.plotlyStackBar = function (data, div_id, options) {
  traceConfigurations = [];
  for (var d in data) {
    var traceConfig = {};
    traceConfig.x = data[d].x;
    traceConfig.y = data[d].y;
    traceConfig.type = 'bar';
    if (options) {
      for (var o in options.config[d]) {
        traceConfig[o] = options.config[d][o]
      }
    }
    traceConfigurations.push(traceConfig);
  }

  var layout = {barmode: 'stack'};

  Plotly.newPlot(div_id, traceConfigurations, layout);
}


// =======================================================
/* plotlyArea draws an area chart using plotly library.
* param: data (array) [{x: [], y: []}]
* param: id (string) Element to display chart.
* param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
    config: (array) use plotly's documentation to fill in chart options.
      NOTE: The config array must be the same length and order as the data array.
    layout: modify the chart layout
  */

module.exports.plotlyArea = function (data, div_id, options) {
  traceConfigurations = [];
  for (var d in data) {
    var traceConfig = {};
    traceConfig.x = data[d].x;
    traceConfig.y = data[d].y;
    traceConfig.type = 'scatter';
    traceConfig.fill = 'tozeroy';
    if (options) {
      for (var o in options.config[d]) {
        if (o == 'fill') {
          traceConfig.fill = options.config[d][o];
          continue;
        }
        traceConfig[o] = options.config[o]
      }
    }
    traceConfigurations.push(traceConfig);
  }
  Plotly.newPlot(div_id, traceConfigurations);
}

// =======================================================
/* plotlyBox draws a box plot using plotly library.
* param: data (array) [{y: []}, {y: []}]
* param: id (string) Element to display chart.
* param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
    config: (array) use plotly's documentation to fill in chart options.
      NOTE: The config array must be the same length and order as the data array.
    layout: modify the chart layout
  */

module.exports.plotlyBox = function (data, div_id, options) {
  traceConfigurations = [];
  for (var d in data) {
    var traceConfig = {};
    traceConfig.y = data[d].y;
    traceConfig.type = 'box';
    if (options) {
      for (var o in options.config[d]) {
        traceConfig[o] = options.config[o]
      }
    }
    traceConfigurations.push(traceConfig);
  }
  Plotly.newPlot(div_id, traceConfigurations);
}

// =======================================================
/* plotlyHeatMap draws a Heat Map using plotly library.
* param: data (object) Example: {z: [[2, 3, 4], [8, 10, 1]]}
* param: id (string) Element to display chart.
* param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
    config: (array) use plotly's documentation to fill in chart options.
      NOTE: The config array must be the same length and order as the data array.
    layout: modify the chart layout
  */

module.exports.plotlyHeatMap = function (data, div_id, options) {
  traceConfig = [{
    z: data.z,
    type: 'heatmap'
  }];

  if (options) {
    for (var o in options) {
      traceConfig[0][o] = options[o];
    }
  }
  Plotly.newPlot(div_id, traceConfig);
}

// =======================================================
/* plotlyHistogram draws a Histogram using plotly library.
* param: data (object) Example: {z: [[2, 3, 4], [8, 10, 1]]}
* param: id (string) Element to display chart.
* param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
    config: (array) use plotly's documentation to fill in chart options.
      NOTE: The config array must be the same length and order as the data array.
    layout: modify the chart layout
  */

module.exports.plotlyHistogram = function (data, div_id, options) {
  traceConfig = [{
    x: data,
    type: 'histogram'
  }];

  if (options) {
    for (var o in options) {
      traceConfig[0][o] = options[o];
    }
  }
  Plotly.newPlot(div_id, traceConfig);
}

  // =======================================================
  /* plotlyChoropleth draws a choropleth using plotly library.
  * param: data (object) Example: {z: [[2, 3, 4], [8, 10, 1]]}
  * param: id (string) Element to display chart.
  * param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
      config: (array) use plotly's documentation to fill in chart options.
        NOTE: The config array must be the same length and order as the data array.
      layout: modify the chart layout
    */

  module.exports.plotlyChoropleth = function (data, div_id, options) {
    function unpack(rows, key) {
      return rows.map(function (row) {
        return row[key];
      });
    }

    if (!(options)) {
      console.error('options is required to render this chart');
    }
    if (!(options.config)) {
      console.error('The options parameter must contain a config object to render this chart.')
    }
    if (!(options.config.fieldName)) {
      console.error('You must specify which field to use from your data.')
    }

    traceConfig = [{
      z: unpack(data, options.config.fieldName),
      type: 'choropleth',
      text: unpack(data, 'state'),
      locationmode: 'USA-states',
      locations: unpack(data, 'code'),
      colorscale: [
        [0, 'rgb(242,240,247)'], [0.2, 'rgb(218,218,235)'],
        [0.4, 'rgb(188,189,220)'], [0.6, 'rgb(158,154,200)'],
        [0.8, 'rgb(117,107,177)'], [1, 'rgb(84,39,143)']
      ],
      colorbar: {
        thickness: 0.2
      },
      marker: {
        line: {
          color: 'rgb(255,255,255)',
          width: 2
        }
      }
    }];

    mapValues = [];
    for (var t in data) {
      mapValues.push(data[t][options.config.fieldName])
    }
    traceConfig.zmin = Math.min(...mapValues
  ),
    traceConfig.zmax = Math.max(...mapValues
  )
    ;

    for (var o in options.config) {
      traceConfig[o] = options.config[o];
    }

    var layout = {
      geo: {
        scope: 'usa',
        showlakes: true,
        lakecolor: 'rgb(255,255,255)'
      }
    };

    if (options.layout) {
      for (var o in options.layout) {
        layout[o] = options.layout[o];
      }
    }
    Plotly.plot(div_id, traceConfig, layout);
  }

  // =======================================================
  /* plotlyPolarScatter draws a polar scatter chart using plotly library.
  * param: data (array) [{r: [], t: []}]
  * param: id (string) Element to display chart.
  * param: options (dict) A dictionary that allows you customize renderings and behaviors. Below are the current options keys for customization.
      config: (array) use plotly's documentation to fill in chart options.
        NOTE: The configuration array must be the same length and order as the data array.
      layout: modify the chart layout
    */

  module.exports.plotlyPolarScatter = function (data, div_id, options) {
    traceConfigurations = [];
    for (var d in data) {
      var traceConfig = {marker: {
          color: 'rgb(117,112,179)'
        }};
      traceConfig.r = data[d].r;
      traceConfig.t = data[d].t;
      traceConfig.type = 'scatter';
      traceConfig.mode = 'markers';
      if (options) {
        for (var o in options.config[d]) {
          traceConfig[o] = options.config[d][o]
        }
      }

      traceConfigurations.push(traceConfig);
    }
    if (data.length < 3) {
      traceConfigurations.push({
        r: [],
        t: [],
        name: ' rr',
        type: 'scatter',
        mode: 'markers',
        showlegend: false,
        opacity: 0
      })
    }
    if (data.length < 2) {
      traceConfigurations.push({
        r: [],
        t: [],
        name: ' tt',
        type: 'scatter',
        mode: 'markers',
        showlegend: false,
        opacity: 0
      })
    }
    options ? Plotly.newPlot(div_id, traceConfigurations, options.config): Plotly.newPlot(div_id, traceConfigurations);
  }