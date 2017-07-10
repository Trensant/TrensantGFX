/* 
    Miscellaneous Independant Javascript Web Helper Functions.
        
    No dependancies on any libraries.  
    
    M A Chatterjee (c) 2013 
    trimmed 2017
    
 */
 
(function (hf, undefined) {
    //"use strict";

    // crude performance measurements
    var gPageTime = 0;
    
    //begin timer measurements from here
    hf.startTimer = function (msg) {
        var x = new Date();
        gPageTime = x.getTime();
        if (typeof msg === 'undefined')
            msg = 'hf.Timer started:';
    };
    
    //read out current timer value
    hf.readTimer = function (msg) {
        x = new Date();
        now  = x.getTime();
        if (typeof msg == 'undefined')
            msg = 'hf.Timer Read:';
        if (msg != "")
            console.log(msg+now);
        del = (now-gPageTime)/1000;
        console.log(' total time:'+del+'secs');
        return del; // just in case the page wants to display the diff
    }

    // getURLParam(key,default_val) 
    // returns the value of the URL encoded variable v if it exists 
    // returns default_value (if it is passed in) returns else 'undefined'  
    //(e.g. myValue = getURLParam(myVarName))
    hf.getURLParam = function (key,default_val) {
        params = {};
        if (typeof location != "undefined")
        if (typeof location.search != "undefined" ) {
            var parts = location.search.substring(1).split('&');
            for (var i = 0; i < parts.length; i++) {
                var nv = parts[i].split('=');
                if (!nv[0]) continue;
                params[nv[0]] = nv[1] || true;
            }
        }
        
        if (params.hasOwnProperty(key) == false)
            return default_val; // note if default_value is undefined then result is still undefined. :)
        return params[key];
    }

    //makes a simple html link from text, href source
    hf.makeLink = function (s,href, ntab ) {
        var h= ((typeof href == "") || (typeof href != "string")) ? s : href;

        ntab = (typeof ntab == "undefined") ? "" : 'target=\"_blank\"';

        //console.log(ntab);
        if (typeof s == "string")
            return "<a href='"+h+"' "+ntab+ " >"+s+"</a>";
        return "";
    }
    



    // set a client side cookie.  Adapted from W3 Schools
    hf.setCookie = function (cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
    
    // get a client side cookie. 
    hf.getCookie = function (cname) {
        var name = cname + "=";
        if (typeof document != "undefined") {
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        }
        return "";
    }
    
    //convert JSON object to pretty HTML string.  Adapted from stack overflow, removed dependancies
    hf.prettyPrint = function (json,tag) {        
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
        if (typeof tag == 'string')
            return "<"+tag+">"+f(json)+"<"+tag+">";
        
        return "<pre>"+f(json)+"</pre>";
    }
    
    
    //emitHTMLTable (t,id)
    //takes a 2D list e.g. [[],[],[]],[[],[],[]],[[],[],[]] and emits as a HTML 
    //table (as a string).  The first row is considered the header.
    //id param is DOM id (e.g. document.getElementById(...))
    //
    // bdiller 6/3/2015 added optional buttons parameters before the cls paramters. 
    // The buttons will get appended at the end of the row.  
    // Buttons is an array of 3 element arrays where each array provides the data for 
    // contructing the button element for each row. 
    // THe first element is a function for generating the function name
    // The second element is the name of the function invoked for the onClick action
    // The third and final element is a function that that generates an associative array 
    // that is passed to both the button name function and onClick event.
    // The cls parameter is still that last argument. This is not currently used in the product, but
    // clients will need to pass a buttons parameter (null or array) so the value gets correctly 
    // bound to the cls parameter
    hf.emitHTMLTable = function (t,id, buttons, cls) {
        var i,j;
        if (typeof id == 'undefined') id = "hf_table_"+Math.round(Math.random()*100000);
        var cls = hf.argSafe(cls,"string","class='striped sortable'");
        var s= "<table "+cls+" id='"+id+"'>";
        s+="<thead>";
        if (t.length >= 1)
        {
            s+="<tr id='"+id+"_row"+0+"'> ";
            for (j=0; j< t[0].length; j++) {
                s+="<th style='text-align:left' id='"+id+"_col"+j+"' >"+t[0][j]+"</th>";
            }
            if (buttons) {
                s+="<th colspan='" + buttons.length + "' style='text-align:left' id='"+id+"_col"+t[0].length+"'>Actions</th>";
            }
            s+="</tr>";
        }

        s+="</thead><tbody>";
        for (i=1; i< t.length; i++) {
            s+="<tr id='"+id+"_row"+i+"'> ";
            for (j=0; j< t[i].length; j++) {
                s+="<td>"+t[i][j]+"</td>";
            }
            if (buttons) {
            	for (var j=0,index=t.length; j < buttons.length; j++,index++) {
        			params = buttons[j][2](t[i]);
            		s += '<td><input type="button" value = "' + buttons[j][0](params) + '" onClick=' + buttons[j][1] + '(' + JSON.stringify(params) + ') ></td>';          		
            	}
            }
            s+="</tr>";
        }
        s+="</tbody>";
        s+="</table>";
        return s;
    }
    
    //constrain input x in between min, max, expects numeric input
    hf.constrain = function (x,min,max) {
        if (max < min) {a=min; min=max; max=a;}
        if (x<=min)	{x=min;}
        if (x>=max)	{x=max;}
        return x;
    }

    //Map an input value z in its natural range in0...in1 to the output 
    //space out0...out1 with optional clipping
    //exp_scale allows sigmoidal warping to stretch input values contrained to a small range. (floating point scale factor)
    hf.mapScaleEXP = function (z, in0, in1, out0, out1, clip, exp_scale) {
        
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
            z=hf.constrain(z,out0,out1);
        return z;
    }
    
    //returns a number from [-1 .. +1] assuming pos, neg, neutral are all positive numbers
    hf.interpWeight = function (pos,neg,neutral) {
        z = (pos+neg+neutral);
        if (z <1)
            z = 1;
        return Math.round((pos-neg)*100/z)/100;
    }
    
    //returns pos neg neutral counts on a scall of -100 to 100 with optional sigmoidal warping
    hf.moodRanged = function(pos,neg,neu,scale) {
        if ((pos+neg+neu)==0)
            neu=1;
        mood = hf.interpWeight(pos,neg,neu)*100;
        mood = hf.mapScaleEXP(mood,-100,100,-100,100,true,scale); 
        mood = Math.round(mood);
        return mood;
    }
    
    
    //returns buzz on scale of 0.. 100.   
    //scale provides optional power warping. (use a small fraction such as 0.4)
    hf.buzzRanged = function(entity_buzz,max_buzz,scale) {
        var max_buzz = max_buzz > 1 ? max_buzz : 1;
        var s = typeof scale == "undefined" ? 1 : scale;
        var br;
        if (max_buzz >= entity_buzz) {
            br = entity_buzz / max_buzz;
        }
        else {
            console.log("buzzRangedError");
            br = 1;
        }
        if (typeof s == "number") 
            br = Math.pow(br,s);
                
        return 100*br;
    }
 
    
    
     
    //isHex returns a number of hex digits found or false if non-hex string.
    //allow is an optional string of characters "-+."etc to permit in the string.
    //the allow characters are not counted in the result
    //examples:
    //  hf.isHEXStr("123a")
    //      returns --> 4
    //  hf.isHEXStr("12-3a")
    //      returns --> false
    //  hf.isHEXStr("12-3a","-")
    //      returns --> 4    
    hf.isHEXStr = function (idstr,allow) {
        if (typeof idstr == "string") {
            idstr = idstr.replace(new RegExp(allow,'g'),"");      
            var isHexReg = new RegExp("^[0-9A-Fa-f]{"+idstr.length+"}$");
            return (isHexReg.test(idstr) == true) ? idstr.length : false;
        }
        // z = 24    // this ways allows arbitrary hex string size as a param...
        // isHexStr = new RegExp("^[0-9A-Fa-f]{"+z+"}$");
        // isHexStr.test(idstr);
        return false;
    }
    
    //returns true is str is a valid moodwire entity id format
    hf.isUUIDStr    = function(str)   {return hf.isHEXStr(str)==24;}
    
    //returns true if str is a valid moodwire api key format
    hf.isAPIKeyStr  = function(str)   {return hf.isHEXStr(str,"-")==32;}
    
    hf.typeOf    = function (x)       {return (typeof x == "undefined") ? "undefined" : (({}).toString.call(x).match(/\s([a-zA-Z]+)/)[1].toLowerCase());};
    
    //simple section renderer for crude mockups
    //examples where block_data is JSON 
    //$("#myDiv).html(hf.emitSection("Interesting Data","This Area contains ...",{...},hf.prettyPrint));
    //example where block_data a table 
    //$("#myDiv).html(hf.emitSection("Interesting Data","This Area contains ...",{...},hf.emitHTMLTable));
    hf.emitSection = function (title, desc, data, renderFunc, options) {
        var s = "",i;
        var rf = hf.prettyPrint; //default renderer, no options needed
        if (renderFunc == "table") 
            rf = hf.emitHTMLTable;

        if (renderFunc == "auto") {
            if (hf.typeOf(data) == "array") 
                rf = hf.emitHTMLTable;
            else
                rf = hf.prettyPrint;
        }
        if (hf.typeOf(renderFunc) == "function")
            rf=renderFunc;
        var dopts = {
            title_tag   : "h3",
            title_style : "",
            title_class : "",
            desc_tag    : "span",
            desc_style  : "",
            desc_class  : "",
            rend        : {}
        }
        if (hf.typeOf(options) != "undefined")
            for (i in options)
                dopts[i] = options[i];

        s+= "<"+dopts["title_tag"]+" style='"+dopts["title_style"]+"' class='"+dopts["title_class"]+"' >"+title+"</"+dopts["title_tag"]+">";
        s+= "<"+dopts["desc_tag"] +" style='"+dopts["desc_style"] +"' class='"+dopts["desc_class"] +"' >"+desc +"</"+dopts["desc_tag"]+">" + "<br>";
        
        s+= (hf.typeOf(options) == "undefined") ? rf(data) : rf(data,options["rend"]);
        return s;
    }
    
    //==================================
    //external style sheet load
    hf.loadExtCSS = function(src) {
         if (document.createStyleSheet) 
             document.createStyleSheet(src);
        else {
                var stylesheet = document.createElement('link');
                stylesheet.href = src;
                stylesheet.rel = 'stylesheet';
                stylesheet.type = 'text/css';
                document.getElementsByTagName('head')[0].appendChild(stylesheet);
        }
    }
    var hfExtCSS = decodeURIComponent(hf.getURLParam('hfExtCSS','none'));
    if (hfExtCSS != 'none') {
        hf.loadExtCSS(hfExtCSS);
    }
    
    //save current sheet as cookie
    if (hf.getURLParam('hfExtCSSSave','none') == 'true') {
        hf.setCookie('hfExtCSS',encodeURIComponent(hfExtCSS),2000);
        console.log(hfstyle);
    }
    
    //allow persistance of a saved style-path
    var hfExtCSSPersist = hf.getURLParam('hfExtCSSPersist','none');
    if (( hfExtCSSPersist== 'true') || ( hfExtCSSPersist== 'false')) {
        hf.setCookie('hfExtCSSPersist',hfExtCSSPersist,2000);
    }
    //load external style sheet path from cookie  instead, 
    //note that url provide css always overides cookie
    if ( (hf.getCookie('hfExtCSSPersist') == 'true') && (hfExtCSS == 'none')) {
        var cssStyleSheet = hf.getCookie('hfExtCSS');
        if (cssStyleSheet != 'none')
            hf.loadExtCSS(decodeURIComponent( cssStyleSheet ));
    }
    
    //===============================================
    hf.loadScript = function(url, callback, where)   {
        
        // Adding the script tag to the head
        var p = (hf.typeOf(where) == 'undefined') ? document.getElementsByTagName('head')[0] : document.getElementsByTagName(where)[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload             = callback;

        // Fire the loading
        p.appendChild(script);
    }
    
    var hfExtScriptPath = decodeURIComponent(hf.getURLParam('hfExtScript','none'));
    
    if (hfExtScriptPath != 'none')
        hf.loadScript(hfExtScriptPath);
    
    //===============================================
    //inline CSS style overides below
    hf.addHeadStyle = function(s) {
        s=decodeURIComponent(s);
        var h=document.getElementsByTagName('head')[0];
        var st = document.createElement('style');
        st.type = 'text/css';
        st.appendChild(document.createTextNode(s));
        h.appendChild(st);        
    }
    
    var hfstyle = decodeURIComponent(hf.getURLParam('hfstyle','none'));
    if (hfstyle != 'none') {
        hf.addHeadStyle(hfstyle);
    }
    
    //save current style as cookie
    if (hf.getURLParam('hfssave','none') == 'true') {
        hf.setCookie('hfstyle',encodeURIComponent(hfstyle),2000);
        console.log(hfstyle);
    }
    
    //allow persistance
    var hfspersist = hf.getURLParam('hfspersist','none');
    if (( hfspersist== 'true') || (hfspersist == 'false')) {
        hf.setCookie('hfspersist',hfspersist,2000);
    }
    
    //load from cookie instead
    if ((hf.getCookie('hfspersist') == 'true') && (hfstyle == 'none')) {
        hf.addHeadStyle( decodeURIComponent(hf.getCookie('hfstyle')));
    }
    
    
    //start timer for simple page timing stats
    hf.startTimer("");
    
})(typeof hf === 'undefined'? this['hf']={}: hf);//(window.hf = window.hf || {});
