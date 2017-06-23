//========================================================================================================
/*  data must be an array of entities of form
     [[Name, UUID, Sentiment, type], ... [] ]
 */

trensantGFX.gglDrawTreemap = function(data,title,domID,w,h,options,onClickCallback) {	     
    var heatmap_data = [];
    heatmap_data.push(['Name','Parent','Buzz','Mood']); // col 4, 'Raw Buzz' used by scattermap but not heatmap
    heatmap_data.push([title ,null,0 ,0]);
    var dupes = {}; //duplicate protector, the ggl treemap chart lib **crashes** on dupes.
    var dupes_list = {}//
    var sum = 0;
    for (i=0; i<data.length; i++) {
        if (data[i][0] in dupes){}
        else {
            dupes[data[i][0]] = 1;		        
            heatmap_data.push([data[i][0],title,data[i][2],data[i][3]]);
            //console.log(data[i][0]+':'+i+':'+data[i][2]+':'+data[i][3]);
        }
    }
    if (dupes_list.length > 0) {
        console.log ('duplicates detected in summary data:'+dupes_list.length);
        for (dupe in dupes_list) {
            console.log("dupe: "+dupe);
        }
    }
    //console.log(heatmap_data); 
    
    var zdata = new google.visualization.arrayToDataTable(heatmap_data);
    var tree = new google.visualization.TreeMap(document.getElementById(domID));
    
    var doptions = {
          title: title,
          titleTextStyle: {fontSize: 16},
          height:h,
          width:w,
          minColor: '#f56',  midColor: '#776',  maxColor: '#5f6',
          minColorValue: -101,	  
          maxColorValue: +101,
          headerHeight: 0,	  //fontSize: 11,
          fontColor: '#eee',				
          showScale: false
    };
    if (typeof options == 'object')
        for (var i in options)
            doptions[i] = options[i];
        
    tree.draw(zdata, doptions);
    /* this old version assumes a global gData which allows us to convert row number of table back to a uuid 
    function treeOnClick() {
        console.log(heatmap_data[tree.getSelection()[0]["row"]+1][0]);		    
        window.location=window.location.origin+window.location.pathname+"?entities="+gData["map"][heatmap_data[tree.getSelection()[0]["row"]+1][0]];
    }
    google.visualization.events.addListener(tree, 'select', treeOnClick);
    */
}//end gglDrawTreeMap()


//============================================================================
  //draw the type rank categories for this entity (if present)  many entites, such as people, don't have typerank features
  function drawTypRank() {

    if (gLastResult["typerank"].length > 0)  {
      $("#typeRankContainerDiv").show();
      var z=[],d={};
      
      z = gLastResult["typerank"].map(function(x){return [x["feature_name"],x["positives"],x["negatives"],x["neutrals"]];});
      z = z.filter(function(x){if (x[0] in d) {console.log("typerank dp:"+x[0]); return false;} d[x[0]] = true;  return true; }) // this due to there being 'general' and 'specific' categories
      console.log(d);
      z.unshift(["Feature", "Positives","Negatives","Neutrals"]);

      var data = google.visualization.arrayToDataTable(z);
        var options = {
        legend: { position: 'top', maxLines: 3 },
        bar: { groupWidth: '65%' },
        chartArea: {left: '15%'},
        isStacked: true
      };
      
      var view = new google.visualization.DataView(data);
      var chart = new google.visualization.BarChart(document.getElementById("typerankDiv"));
          chart.draw(view, options);
      }
  }
  //============================================================================
  //draw the entity picture and description area.  Futrure: include more metadata
  function drawEntitiesTab() {
    gLastResult["name"]= gLastResult["entities"]["hr_name_array"]["en"];
    $("#nameDiv").html(gLastResult["name"]);
    var imgPath =  "http://api.trensant.com/"+gLastResult["entities"]["images"][0]["url"];
    $("#imgDiv").css({"background-size":"contain","background-position":"center","background-repeat":"no-repeat","background-image":'url(\"'+imgPath+'\")'})
    $("#descDiv").html(gLastResult["entities"]["entity_description"])
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
  //============================================================================
  //draw rowWordsTimeCloud()
  //data must be of the form {{date:.. ,  words:{word1:freq1, word2:freq2}}}
  function drawRowWordsTime() {
    //need to get words in to [ [2017-05-10 , [[word, freq] ... [word,freq]], [2017-05-11, [[w/f]], ... ] format
    var j,i,z=[],h="";
    for (j in gLastResult["entity-words"]) {
      var w=[];
      for (i in gLastResult["entity-words"][j]["words"])
        w.push([i,gLastResult["entity-words"][j]["words"][i],["red","green","purple","orange"][i.length%4]]);
      w= w.sort(function(a,b){return b[1]-a[1]}).slice(0,10);
      z.push([gLastResult["entity-words"][j]["date"],w]);     
    }
    z.sort(function(a,b) {return (a[0]== b[0]) ? 0 : a[0] < b[0] ? 1 : -1;});  //words now in proper format

    for (i in z)
      h+= "<p class='wordRowClass'><span>"+z[i][0]+"&nbsp;&nbsp;</span>"+trensant.drawRowWordCloud(z[i][1],0,{"maxSize":35,"minSize":8,"sort":"up"})+"</p>";
    document.getElementById("timeWordCloudDiv").innerHTML = "<div style='overflow-y:scroll; height:100%;'>"+h+"</div>";
  }
  //============================================================================
  // draw stacked emoitns chart
  function drawStackedEmotion() {
    var intData = gLastResult["emotions-intervals"].map(function(x){
      var a = [x["date"]],i,z;
      var e = ["anger","anticipation","digust","fear","joy","sadness","surpise","trust"];
      for (i in e) {
        a.push (  (typeof x[e[i]] != "undefined") ? x[e[i]] : 0 );
      }
      return a;
    })
    
    intData.unshift(["Week", "Anger","Anticipation","Digust","Fear","Joy","Sadness","Surpise","Trust" ])
    var data = google.visualization.arrayToDataTable(intData);

        var options = {
      //title: 'Emotion Trends',
      vAxis: {title: 'Emotions'},
      isStacked: 'relative'
    };
        var chart = new google.visualization.SteppedAreaChart(document.getElementById("emotionsTrendDiv"));
        chart.draw(data, options);
  }
  //============================================================================
  //draw Summary emotions pie chart ("anticipation, joy, etc...")
  function drawEmotionsTab() {    
      //console.log(response);
      var edata = gLastResult["emotions"][0];
      var sdata = [["Emotion","Percent"]];
      var i;
      for (i in edata) {
        if (["entity_id","name","type"].indexOf(i) == -1)
          sdata.push([ i, edata[i]]);
      }
      var data = google.visualization.arrayToDataTable( sdata);
        var options = {
          legend:'right'
        };
        var chart = new google.visualization.PieChart(document.getElementById('emotionsDiv'),options);
        chart.draw(data, options);
  }

  ////============================================================================
  //pie ... its whats for desert
    function drawMoodPie(pos,neg,neu,title_text,id) {
      if (typeof pos !== 'number')
          pos=0;
      if (typeof neg !== 'number')
          neg=0;
      if (typeof neu !== 'number')
          neu=0;
          
      var data = google.visualization.arrayToDataTable([
      ['Moodrank', 'Volume'],
      ['Positives',     pos],
      ['Negatives',     neg],
      ['Neutrals',      neu]
      ]);
      
      var options = {
      title: title_text, 
      titleTextStyle: {fontSize: 16},
      colors: ['green','red','#777'],
      legend: {position:'right'},
      backgroundColor: { fill:'transparent' },
      pieHole: 0.4
      };
      
      var c3 = new google.visualization.PieChart(document.getElementById(id));
      c3.draw(data, options);
    }

    //===============================================================================
    function drawRegionMap() {
     //trensant.abbrState("New York","abbr")
    var i,d=[['State','Mentions']];
    for (i in gLastResult["regionalrank"]) {
      d.push([ "US-"+trensant.abbrState(gLastResult["regionalrank"][i]["location_name"],"abbr") , gLastResult["regionalrank"][i]["buzz"]]);
    }
    var data = google.visualization.arrayToDataTable(d);
    var geochart = new google.visualization.GeoChart(  document.getElementById('mapDiv'));
    geochart.draw(data, { region: "US", resolution: "provinces"});
    }
    //===============================================================================
    function drawTrendsTab() {
      var i=-1;
      var data = gLastResult["intervals"].map(function(x){i++; return [x["date"], x["buzz"],x["moodrank"]];}); // can use i instead of x["date"] for numeric days instead
      data.pop(); // drop the last day which is incomplete because its in-progress (see API docs about getting hourly level intervals etc)
      data.unshift(["Day","Buzz","Mood"]);

      var cdata = google.visualization.arrayToDataTable(data);
        var doptions = { //default options
      //hAxis: {maxAlternation:2},
            series: {
        // Gives each series an axis name that matches the Y-axis below.
        0: {targetAxisIndex: 0, axis:'Buzz', color:'red'}, //{axis: 'Buzz', color: 'red'},
        1: {targetAxisIndex: 1, axis:'Mood', color: 'blue'} //{axis: 'Mood', color: 'blue'}
      },
      
      vAxes: {
        // Adds labels to each axis; they don't have to match the axis names.
          0: {label: 'Buzz (mentions)', color:'red'},
          1: {label: 'Mood', color:'blue', viewWindowMode : 'explicit',
            viewWindow:{
                                  max:110,
                                  min:-100
                                  }
                              }
          },
      
      //legend: "none",
      legend : {position : "top"},
            chartArea: {  width: "60%", height: "60%" }
        };
        
        if (typeof options == 'object')
            for (var i in options)
                doptions[i] = options[i];

        var c2 = new google.visualization.LineChart(document.getElementById("trendsDiv"));
      c2.draw(cdata, doptions);
    }
    //===============================================================================
    function drawSummaryGfx() {
      drawMoodPie(gLastResult["summary"][0]["positives"],gLastResult["summary"][0]["negatives"],gLastResult["summary"][0]["neutrals"],null,"sentimentDiv");
    }
  //========================================================================================================
  function drawConnectivityTab() {
    //DOMid = connectivity-div
    // data required:  
    //  1. entities (analyze-text --> entity list) ... currenlty this requires clicking on the entities tab first
    //  2. relations info (with entities get relations)
    /*
    var i,cdata= {
        "name" : "Current Article Text",
        "uuid" : "none",
        "type" : "article",
        "children" : []
      };
    for (i in gLastResult["relations"]) {
      var e = gLastResult["relations"][i];
      cdata["children"].push({"name":e["child_name"], "uuid":i["child_id"], children:[],"type":i["child_type"]});
    }
    gLastResult["relations-tree"] = {};
    gLastResult["relations-tree"] = cdata;
    var clickme = function(x){ console.log(x); window.open('https://demo.trensant.com/item/'+x["uuid"],'_blank')}
    trensant.d3DrawRadialGraph(cdata,"#relationsDiv",{height:"225px",width:"225px",diameter:"200px","onclick":clickme});
    */
    var d={},z = gLastResult["relations"].reduce(function(s,x){
      var t = (x["child_type"] == "other") ? "concept" : x["child_type"]; 
      if (x["parent_id"] == gLastResult["uuid"])
        s.push( [x["child_name"],x["child_id"],t]); 

      t = (x["parent_type"] == "other") ? "concept" : x["parent_type"]; 
      if (x["child_id"] == gLastResult["uuid"])
        s.push( [x["parent_name"],x["parent_id"],t]);
      return s;},[])
    z= z.filter(function(x){if (x[1] in d) return false; d[x[1]]=true; return true; }); //remove dupes (not a bug -- asked for 'both' in relations fetch)
    trensant.gglDrawEntityTable(z,"relationsDiv"); 
  }

  //========================================================================================================
  function drawArticlesTab() {
    var i,h="";
    for (i=0; i<gLastResult["articles"].length; i++) {
      var c=gLastResult["articles"][i];
      var a = "";
      a += hf.makeImg(c["images"][0]["url"],"related article","100%","100px");
      var atitle = (c.article_title.length > 75) ? c.article_title.substr(0,75)+"..." : c.article_title; 
      a += trensant.html("h4",atitle);
      var abody = (c.article_body.length > 75) ? c.article_body.substr(0,75)+"..." : c.article.body;
      //a += trensant.html("div",abody);
      var b=trensant.html("div",a," height: 250px; "," col-md-2 articleClass ");//"width:200px; height:400px; display:inline-block;align:float:left; padding:5px;");

      h+= hf.makeLink(b,c.url,"true");
    }
    $("#articlesDiv").html(trensant.html("div",h,""," "));
  }
