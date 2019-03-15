
"use safe"

function scatterchart(targetDOMelement) { 
	
	var scatterchartObject = {};

	scatterchartObject.appendedMouseOverFunction = function (callbackFunction) {
		console.log("appendedMouseOverFunction called", callbackFunction)
		appendedMouseOverFunction = callbackFunction;
		render();
		return scatterchartObject;
	}	
	
	scatterchartObject.appendedMouseOutFunction = function (callbackFunction) {
		appendedMouseOutFunction = callbackFunction;
		render();
		return scatterchartObject;
	}	

	scatterchartObject.loadAndRenderDataset = function (data) {
		dataset=data.map(d=>d); //create local copy of references so that we can sort etc.
		render();
		return scatterchartObject;
	}	

	scatterchartObject.overrideDataFieldFunction = function (dataFieldFunction) {
		dataField = dataFieldFunction;
		return scatterchartObject;
	}

	scatterchartObject.overrideKeyFunction = function (keyFunction) {
		GUPkeyField = yAxisCategoryFunction = keyFunction;
		return scatterchartObject;
	}
	
	scatterchartObject.overrideMouseOverFunction = function (callbackFunction) {
		mouseOverFunction = callbackFunction;
		render();
		return scatterchartObject;
	}
	
	scatterchartObject.overrideMouseOutFunction = function (callbackFunction) {
		mouseOutFunction = callbackFunction;
		render(); //Needed to update DOM
		return scatterchartObject;
	}
	
	scatterchartObject.overrideTooltipFunction = function (toolTipFunction) {
		tooltip = toolTipFunction;
		return scatterchartObject;
	}
	
	scatterchartObject.overrideMouseClickFunction = function (fn) {
		mouseClick2Function = fn;
		render(); //Needed to update DOM if they exist
		return scatterchartObject;
	}	
	
	scatterchartObject.maxValueOfDataField = function (max) {
		maxValueOfDataset = max;
		maxValueOfDataField=function(){return maxValueOfDataset};
		return scatterchartObject;
	}	
	
	scatterchartObject.render = function (callbackFunction) {
		render(); //Needed to update DOM
		return scatterchartObject;
	}	
		
	scatterchartObject.sortByDataField = function () {
		dataset.sort((a,b)=>dataField(a)-dataField(b))
		render();
		return scatterchartObject;
	}		
	
	scatterchartObject.reverseSortByDataField = function () {
		dataset.sort((a,b)=>dataField(b)-dataField(a))
		render();
		return scatterchartObject;
	}	
	
	scatterchartObject.sortByKey = function () {
		//for security we will use D3's descending operator here
		dataset.sort((a,b)=>d3.descending(GUPkeyField(b),GUPkeyField(a)))
		render();
		return scatterchartObject;
	}	
	
	scatterchartObject.setTransform = function (t) {
		//Set the transform on the svg
		svg.attr("transform", t)
		return scatterchartObject;
	}	
	
	scatterchartObject.yAxisIndent = function (indent) {
		yAxisIndent=indent;
		return scatterchartObject;
	}
	

	var mouseClick2Function= function(d,i){
		console.log("hello------" , d)
		overrideMouseClickFunction(d,i);
	}
	//=================== PRIVATE VARIABLES ====================================
	//Width and height of svg canvas
	var svgWidth = 700; 
	var svgHeight = 400;
	var dataset = [];
	var xScale = d3.scaleLinear();
	var yScale = d3.scaleBand(); 
	var yAxisIndent = 300; 
	var maxValueOfDataset; 

	var svg = d3
		.select(targetDOMelement)
		.append("svg")
		.attr("width", svgWidth)
		.attr("height", svgHeight)
		.classed("scatterchart",true);	
				
	var yAxis = svg
		.append("g")
		.classed("yAxis", true);	
		
	var xAxis = svg
		.append("g")
		.classed("xAxis", true);	

	var mouse		
	
	
	var dataField = function(d){return d.datafield} 
	var tooltip = function(d){return  d.key + ": "+ d.datafield} 
	var yAxisCategoryFunction = function(d){return d.key} //Categories for y-axis
	var GUPkeyField = yAxisCategoryFunction; //For 'keyed' GUP rendering (set to y-axis category)
	
	
	//=================== OTHER PRIVATE FUNCTIONS ====================================	
	var maxValueOfDataField = function(){
		//Find the maximum value of the data field for the x scaling function using a handy d3 max() method 
		//This will be used to set (normally used ) 
		return d3.max(dataset, dataField)
	};	
	
	var appendedMouseOutFunction = function(){};
		
	var appendedMouseOverFunction = function(){};
		
	var mouseOverFunction = function (d,i){
        d3.select(this).classed("highlight", true).classed("noHighlight", false);
		appendedMouseOverFunction(d,i);
	}
	
	var mouseOutFunction = function (d,i){
        d3.select(this).classed("highlight", false).classed("noHighlight", true);
		appendedMouseOutFunction(d,i);
	}	
	
	var mouseClick2Function = function (d,i){
        console.log("barchart click function = nothing at the moment, d=",d)
	};

	function render () {
		updateScalesAndRenderAxes();
		GUP_scatter();
	}
	
	function updateScalesAndRenderAxes(){
		//Set scales to reflect any change in svgWidth, svgHeight or the dataset size or max value
		xScale
			.domain([0, maxValueOfDataField()])
			.range([0, svgWidth-(yAxisIndent+10)]);
		yScale
			.domain(dataset.map(yAxisCategoryFunction)) //Load y-axis categories into yScale
			.rangeRound([25, svgHeight-40])
			.padding([.1]);
			
		//Now render the y-axis using the new yScale
		var yAxisGenerator = d3.axisLeft(yScale);
		svg.select(".yAxis")
			.transition().duration(1000).delay(1000)
			.attr("transform", "translate(" + yAxisIndent + ",0)")
			.call(yAxisGenerator);	
			
		//Now render the x-axis using the new xScale
		var xAxisGenerator = d3.axisTop(xScale);
		svg.select(".xAxis")
			.transition().duration(1000).delay(1000)
			.attr("transform", "translate(" + yAxisIndent + ",20)")
			.call(xAxisGenerator);
	};

	function GUP_scatter(){
		var selection = svg
			.selectAll("circle")
			.data(dataset, GUPkeyField);

		var enterSel = selection 
			.enter()
			.append("circle")

			
		enterSel 
			.attr("class", d=>("key--"+GUPkeyField(d)))
			.classed("circle enterSelection", true)
			.classed("highlight", d=>d.highlight)
			
		enterSel 
			.transition()
			.duration(2000)
				.attr("r",4.5)
				.attr("cx", function(d) {return yAxisIndent + xScale(dataField(d));})
				.attr("cy", function(d, i) {return yScale(yAxisCategoryFunction(d)) + (yScale.bandwidth()*0.5);});
				
		enterSel 
			.append("title")
				.text(tooltip)
				
			
		//GUP UPDATE (anything that is already on the page)
		var updateSel = selection //update CSS classes
			.classed("noHighlight updateSelection", true)
			.classed("exitSelection", false)
			.classed("highlight", d=>d.highlight)
		
		updateSel	//update bars
			.transition()
			.duration(2000)
				.attr("cx", function(d) {return yAxisIndent + xScale(dataField(d));})
				.attr("cy", function(d, i) {return yScale(yAxisCategoryFunction(d)) + (yScale.bandwidth()*0.5);});
				
		updateSel //update tool tip
			.select("title") //Note that we already created a <title></title> in the Enter selection
				.text(tooltip)
				
			
		//GUP: Merged Enter & Update selections (so we don't write these twice) 
		var mergedSel = enterSel.merge(selection)

		mergedSel
			.on("mouseover", mouseOverFunction)
			.on("mouseout", mouseOutFunction)
			.on("click", mouseClick2Function)			

			
		//GUP EXIT selection 
		var exitSel = selection.exit()
			.classed("highlight updateSelection enterSelection", false)
			.classed("exitSelection", true)
				.remove() 
	};
	
	
	//================== IMPORTANT do not delete ==================================
	return scatterchartObject; // return the main object to the caller to create an instance of the 'class'
	
} //End of barchart() declaration	

