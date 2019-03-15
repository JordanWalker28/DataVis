

function piechart(targetDOMelement) { 

	var piechartObject = {};

	piechartObject.overrideDataFieldFunction = function (dataFieldFunction) {
		dataField = dataFieldFunction;
		return piechartObject;
	}
	
	piechartObject.overrideMouseOverFunction = function (callbackFunction) {
		mouseOverFunction = callbackFunction;
		layoutAndRender();
		return piechartObject;
	}
	
	piechartObject.overrideMouseOutFunction = function (callbackFunction) {
		mouseOutFunction = callbackFunction;
		layoutAndRender();
		return piechartObject;
	}

	
	piechartObject.render = function (callbackFunction) {
		layoutAndRender();
		return piechartObject;
	}
	
	piechartObject.loadAndRenderDataset = function (data) {
		dataset=data;

		console.log(dataset);
		console.log('here');
		layoutAndRender();
		return piechartObject;
	}
	

	piechartObject.overrideTooltipFunction = function (toolTipFunction) {
		tooltip = toolTipFunction;
		return piechartObject;
	}

	piechartObject.overrideMouseClickFunction = function (fn) {
		mouseClick2Function = fn;
		render(); //Needed to update DOM if they exist
		return piechartObject;
	}	

	piechartObject.reverseSortByDataField = function () {
		dataset.sort((a,b)=>dataField(b)-dataField(a))
		render();
		return piechartObject;
	}	





	
	//=================== PRIVATE VARIABLES ====================================
	//Width and height of svg canvas
	var svgWidth = 700; 
	var svgHeight = 600;
	var color = d3.scaleOrdinal().range(["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b", '#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525','#000000','#ef3b2c','#cb181d','#a50f15','#67000d', '#54278f', '#3f007d']);
	var dataset = [];
	var text = "";
	
	

	//=================== INITIALISATION CODE ====================================
	
	//Declare and append SVG element
	var svg = d3.select(targetDOMelement)
				.append("svg")
				.attr("width", svgWidth)
				.attr("height", svgHeight)
				.classed ("piechart",true)
				.attr("text-anchor", "middle")
      			.style("font", "12px sans-serif");
				
	
	//Declare and append group that we will use tp center the piechart within the svg
	var grp = svg.append("g");


	//=================== PRIVATE FUNCTIONS ====================================

	var dataField = function(d){return d.dataField}
	var tooltip = function(d){return  d.UoAString+ ": "+ GUPkeyField}
	var key = function(d) { return d.data["UoAString"]; };

	
	var mouseClick2Function = function (d,i){
		console.log("key is==", d.key)
        console.log("piechart click function = nothing at the moment, d=",d.data["UoAString"])
	};


	var appendedMouseOutFunction = function(){};
		
	var appendedMouseOverFunction = function(){};

	//Set up shape generator
	var arcShapeGenerator = d3.arc()
		.outerRadius(svgHeight/3)
		.innerRadius(svgHeight/6)
		.padAngle(0.01)
		.cornerRadius(8);


		var arcOver = d3.arc()
		.outerRadius(svgHeight/2)
		.innerRadius(svgHeight/6)
		.padAngle(0.01)
		.cornerRadius(8);

		var labelArc = d3.arc()
    		.outerRadius(svgHeight/2)
    		.innerRadius(svgHeight/6);


	function layoutAndRender(){

		var arcsLayout = d3.pie()
			.value(dataField)
			.sort(null)
			(dataset);
		grp.attr("transform", "translate("+[svgWidth/2, svgHeight/2]+")")
		GUP_pies(arcsLayout, arcShapeGenerator);		
	}
	

	function GUP_pies(arcsLayout, arcShapeGenerator){

		var selection = grp.selectAll("path")
			.data(arcsLayout, key);

		var selection2 = grp.selectAll("text")
			.data(arcsLayout, key);


		var enterSel = selection
			.enter()
			.append("path")
			.style("fill", function(d, i) { return color(i); })
			.classed("noHighlight", true)	
			.classed("highlight", false)
			.on("click", mouseClick2Function)
			.on("mouseover", function(d) {d3.select(this).transition().duration(2000).attr("d", arcOver); })
			.on("mouseout", function(d) {d3.select(this).transition().duration(2000).attr("d", arcShapeGenerator);})
		.each(function(d) { this.dPrevious = d; }) ;


 

		//GUP ENTER AND UPDATE selection
		var mergedSel = enterSel.merge(selection)			
		
		mergedSel
			.on("click", mouseClick2Function)
				.classed("highlight", true)
				.classed("noHighlight", false);
			
		mergedSel
			.on("click", mouseClick2Function)
				.classed("highlight", false)
				.classed("noHighlight", true);
			
		mergedSel
		.attr("fill",function(d){return d.data.colour })
			.on("click", mouseClick2Function);

		
			
		mergedSel
			.transition()
			.duration(750)
			.attrTween("d", arcTween); //Use custom tween to draw arcs
		
		//GUP EXIT selection 
		selection.exit()
			.remove() 

	};
	

	//Ignore this function unless you really want to know how interpolators work
	function arcTween(dNew) {
		//Create the linear interpolator function
		//this provides a linear interpolation of the start and end angles 
		//stored 'd' (starting at the previous values in 'd' and ending at the new values in 'd')
		var interpolateAngles = d3.interpolate(this.dPrevious, dNew); 
		//Now store new d for next interpoloation
		this.dPrevious = dNew;
		//Return shape (path for the arc) for time t (t goes from 0 ... 1)
		return function(t) {return arcShapeGenerator(interpolateAngles(t)) }; 
	}	
	
	
	//================== IMPORTANT do not delete ==================================
	return piechartObject; // return the main object to the caller to create an instance of the 'class'
	
} //End of piechart() declaration	