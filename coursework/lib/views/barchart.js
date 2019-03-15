
function barchart(targetDOMelement) { 
	
	var barchartObject = {};

	barchartObject.appendedMouseOverFunction = function (callbackFunction) {
		console.log("appendedMouseOverFunction called", callbackFunction)
		appendedMouseOverFunction = callbackFunction;
		render();
		return barchartObject;
	}	
	
	barchartObject.appendedMouseOutFunction = function (callbackFunction) {
		appendedMouseOutFunction = callbackFunction;
		render();
		return barchartObject;
	}	

	barchartObject.loadAndRenderDataset = function (data) {
		dataset=data; //create local copy of references so that we can sort etc.
		render();
		return barchartObject;
	}	

	barchartObject.overrideDataFieldFunction = function (dataFieldFunction) {
		dataField = dataFieldFunction;
		return barchartObject;
	}

	barchartObject.overrideKeyFunction = function (keyFunction) {
		GUPkeyField = yAxisCategoryFunction = keyFunction;
		return barchartObject;
	}
	
	barchartObject.overrideMouseOverFunction = function (callbackFunction) {
		mouseOverFunction = callbackFunction;
		render();
		return barchartObject;
	}
	
	barchartObject.overrideMouseOutFunction = function (callbackFunction) {
		mouseOutFunction = callbackFunction;
		render(); //Needed to update DOM
		return barchartObject;
	}
	
	barchartObject.overrideTooltipFunction = function (toolTipFunction) {
		tooltip = toolTipFunction;
		return barchartObject;
	}
	
	barchartObject.overrideMouseClickFunction = function (fn) {
		mouseClick2Function = fn;
		render(); //Needed to update DOM if they exist
		return barchartObject;
	}	
	
	barchartObject.maxValueOfDataField = function (max) {
		maxValueOfDataset = max;
		maxValueOfDataField=function(){return maxValueOfDataset};
		return barchartObject;
	}	
	
	barchartObject.render = function (callbackFunction) {
		render(); //Needed to update DOM
		return barchartObject;
	}	
		
	barchartObject.sortByDataField = function () {
		dataset.sort((a,b)=>dataField(a)-dataField(b))
		render();
		return barchartObject;
	}		
	
	barchartObject.reverseSortByDataField = function () {
		dataset.sort((a,b)=>dataField(b)-dataField(a))
		render();
		return barchartObject;
	}	
	
	barchartObject.sortByKey = function () {
		//for security we will use D3's descending operator here
		dataset.sort((a,b)=>d3.descending(GUPkeyField(b),GUPkeyField(a)))
		render();
		return barchartObject;
	}	
	
	barchartObject.setTransform = function (t) {
		//Set the transform on the svg
		svg.attr("transform", t)
		return barchartObject;
	}	
	
	barchartObject.yAxisIndent = function (indent) {
		yAxisIndent=indent;
		return barchartObject;
	}
	

	
	//=================== PRIVATE VARIABLES ====================================
	//Width and height of svg canvas
	var svgWidth = 700; 
	var svgHeight = 400;
	var dataset = [];
	var xScale = d3.scaleLinear();
	var yScale = d3.scaleBand(); 
	var yAxisIndent = 200; 
	var maxValueOfDataset; 

	var svg = d3
		.select(targetDOMelement)
		.append("svg")
		.attr("width", svgWidth)
		.attr("height", svgHeight)
		.classed("barchart",true);	
				
	var yAxis = svg
		.append("g")
		.classed("yAxis", true);	
		
	var xAxis = svg
		.append("g")
		.classed("xAxis", true);			
	
	
	var dataField = function(d){return d.weight} 
	var tooltip = function(d){return  d.topicAs3words + ": "+ d.weight} 
	var yAxisCategoryFunction = function(d){return d.topicAs3words} //Categories for y-axis
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
		GUP_bars();
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

	function GUP_bars(){
		//GUP = General Update Pattern to render bars 

		//GUP: BIND DATA to DOM placeholders
		var selection = svg
			.selectAll(".bars")
			.data(dataset, GUPkeyField);
			
			
	   //GUP: ENTER SELECTION 
		var enterSel = selection //Create DOM rectangles, positioned @ x=yAxisIndent
			.enter()
			.append("rect")
			.attr("x", yAxisIndent)
			
		enterSel //Add CSS classes	
			.attr("class", d=>("key--"+GUPkeyField(d)))
			.classed("bars enterSelection", true)
			.classed("highlight", d=>d.highlight)
			
		enterSel //Size the bars
			.transition()
			.duration(1000)
			.delay(2000)
				.attr("width", function(d) {return xScale(dataField(d));})
				.attr("y", function(d, i) {return yScale(yAxisCategoryFunction(d));})
				.attr("height", function(){return yScale.bandwidth()});
				
		enterSel //Add tooltip
			.append("title")
				.text(tooltip)
				
			
		//GUP UPDATE (anything that is already on the page)
		var updateSel = selection //update CSS classes
			.classed("noHighlight updateSelection", true)
			.classed("highlight enterSelection exitSelection", false)
			.classed("highlight", d=>d.highlight)
		
		updateSel	//update bars
			.transition()
			.duration(1000)
			.delay(1000)
				.attr("width", function(d) {return xScale(dataField(d));})
				.attr("y", function(d, i) {return yScale(yAxisCategoryFunction(d));})
				.attr("height", function(){return yScale.bandwidth()});
				
		updateSel //update tool tip
			.select("title") //Note that we already created a <title></title> in the Enter selection
				.text(tooltip)
				
			
		//GUP: Merged Enter & Update selections (so we don't write these twice) 
		var mergedSel = enterSel.merge(selection)
			.on("mouseover", mouseOverFunction)
			.on("mouseout", mouseOutFunction)
			.on("click", mouseClick2Function)			

			
		//GUP EXIT selection 
		var exitSel = selection.exit()
			.classed("highlight updateSelection enterSelection", false)
			.classed("exitSelection", true)
			.transition()
			.duration(1000)
				.attr("width",0)
				.remove() 
	};
	
	
	//================== IMPORTANT do not delete ==================================
	return barchartObject; // return the main object to the caller to create an instance of the 'class'
	
} //End of barchart() declaration	

