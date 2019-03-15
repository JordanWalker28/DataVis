	var hierarchyGraph;

	function sunburst(targetDOMelement) {
		var sunburstObject = {};
		sunburstObject.addCSSClassesToDOMelements = function(selectors, cssClassName, trueFalse) {
			selectors.forEach(s => grp.selectAll(s).classed(cssClassName, trueFalse))
			return sunburstObject;
		}
		sunburstObject.loadAndRenderDataset = function(jsonHierarchy) {
			datasetAsJsonD3Hierarchy = jsonHierarchy;
			hierarchyGraph = d3.hierarchy(datasetAsJsonD3Hierarchy);
			addsunburstXYdataAndRender(hierarchyGraph);
			return sunburstObject;
		}
		sunburstObject.loadAndRenderNestDataset = function(nestFormatHierarchy, rootName) {
			layoutAndRenderHierarchyInNestFormat(nestFormatHierarchy, rootName)
			return sunburstObject;
		}
		sunburstObject.loadAndRenderFlatDataset = function(flatDataset, rootName, keys) {
			nestFormatHierarchy = createNestFormatHierarchyFromFlatDataset(flatDataset, keys);
			layoutAndRenderHierarchyInNestFormat(nestFormatHierarchy, rootName)
			return sunburstObject;
		}
		sunburstObject.nodeLabelIfNoKey = function(fn) {
			nodeLabelIfNoKey = fn;
			return sunburstObject;
		}
		sunburstObject.appendClickFunction = function(fn) {
			appendClickFunction = fn;
			return sunburstObject;
		}
		sunburstObject.getDatasetAsJsonD3Hierarchy = function() {
			return datasetAsJsonD3Hierarchy;
		}
		sunburstObject.appendedMouseOverFunction = function(callbackFunction) {
			console.log("appendedMouseOverFunction called", callbackFunction)
			appendedMouseOverFunction = callbackFunction;
			return sunburstObject;
		}
		sunburstObject.appendedMouseOutFunction = function(callbackFunction) {
			appendedMouseOutFunction = callbackFunction;
			return sunburstObject;
		}
		sunburstObject.overrideMouseOverFunction = function(callbackFunction) {
			mouseOverFunction = callbackFunction;
			render();
			return sunburstObject;
		}
		sunburstObject.overrideMouseOutFunction = function(callbackFunction) {
			mouseOutFunction = callbackFunction;
			render(); //Needed to update DOM
			return sunburstObject;
		}
		sunburstObject.overrideTooltipFunction = function(toolTipFunction) {
			tooltip = toolTipFunction;
			return sunburstObject;
		}
		sunburstObject.render = function(callbackFunction) {
			render(); //Needed to update DOM
			return sunburstObject;
		}
		var tooltip = function(d) {
			return d.key + ": " + d.value
		}
		var clickFunction = function(clickedNode, i) {
			clickedNode.xAtEndPreviousGUPrun = clickedNode.x;
			clickedNode.yAtEndPreviousGUPrun = clickedNode.y;
			calculateXYpositionsAndRender(hierarchyGraph, clickedNode);
			appendClickFunction(clickedNode, i);
		}
		var appendedMouseOutFunction = function() {};
		var appendedMouseOverFunction = function() {};
		var width = 700,
			height = 700,
			radius = (Math.min(width, height) / 2) - 10;
		var formatNumber = d3.format(",d");
		var x = d3.scaleLinear().range([0, 2 * Math.PI]);
		var y = d3.scaleSqrt().range([0, radius]);
		var color = d3.scaleOrdinal().range(["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b", '#d9d9d9', '#bdbdbd', '#969696']);
		var partition = d3.partition();
		var b = {
			w: 100,
			h: 70,
			s: 10,
			t: 15
		};
		var arc = d3.arc().startAngle(function(d) {
			return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
		}).endAngle(function(d) {
			return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
		}).innerRadius(function(d) {
			return Math.max(0, y(d.y0));
		}).outerRadius(function(d) {
			return Math.max(0, y(d.y1));
		});
		var grp = d3.select(targetDOMelement).append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");
		var nodesGroup = grp.append("g").classed("nodesGroup", true);
		var linksGroup = grp.append("g").classed("linksGroup", true);
		var datasetAsJsonD3Hierarchy;
		var node;
		var clickedNode;
		var listOfNodes;
		var totalSize = 0;
		initializeBreadcrumbTrail();
		//=================== PRIVATE FUNCTIONS ====================================
		var nodeLabelIfNoKey = function() {
			return "No name set"
		};
		var appendClickFunction = function() {
			console.log("No click fn appended")
		};
		var nodeLabel = function(d) {
			return d.data.name + "(height:" + d.height + ")";
		}

		function layoutAndRenderHierarchyInNestFormat(nestFormatHierarchy, rootName) {
			datasetAsJsonD3Hierarchy = {
				"key": rootName,
				"values": nestFormatHierarchy
			}
			nodesGroup.append("svg:circle").attr("r", radius).style("opacity", 0)

			function childrenAcessor(d) {
				return d.values
			}
			datasetAsJsonD3Hierarchy = {
				key: rootName,
				values: nestFormatHierarchy
			};
			hierarchyGraph = d3.hierarchy(datasetAsJsonD3Hierarchy, childrenAcessor).sum(function(d) {
				return d.value != undefined ? d.value.length : 0
			});
			node = hierarchyGraph;
			nodeLabel = function(d) {
				if (key) return d.data.key + "(height:" + d.height + ")";
				else return nodeLabelIfNoKey(d);
			}
			calculateXYpositionsAndRender(hierarchyGraph);
		}

		function arcTweenData(a, i) {
			var oi = d3.interpolate({
				x0: a.x0s ? a.x0s : 0,
				x1: a.x1s ? a.x1s : 0
			}, a);

			function tween(t) {
				var b = oi(t);
				a.x0s = b.x0;
				a.x1s = b.x1;
				return arc(b);
			}
			if (i == 0) {
				var xd = d3.interpolate(x.domain(), [node.x0, node.x1]);
				return function(t) {
					x.domain(xd(t));
					return tween(t);
				};
			} else {
				return tween;
			}
		}

		function arcTweenZoom(d) {
			var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
				yd = d3.interpolate(y.domain(), [d.y0, 1]), // [d.y0, 1]
				yr = d3.interpolate(y.range(), [d.y0 ? 40 : 0, radius]);
			return function(d, i) {
				return i ? function(t) {
					return arc(d);
				} : function(t) {
					x.domain(xd(t));
					y.domain(yd(t)).range(yr(t));
					return arc(d);
				};
			};
		}

		function calculateXYpositionsAndRender(hierarchyGraph) {
			var mysunburstLayoutGenerator = d3.partition();
			var hierarchyGraphWithPositions = mysunburstLayoutGenerator(hierarchyGraph);
			listOfNodes = hierarchyGraphWithPositions.descendants();
			GUPrenderNodes(listOfNodes);
		}

		function GUPrenderNodes(listOfNodes) {
			//DATA BIND
			var selection = nodesGroup.selectAll("g.cssClassNode").data(listOfNodes, generateUniqueKey);
			//ENTER  
			var enterSelection = selection.enter().append("path").attr("class", d => {
				if (d.data.key) return "nest-key--" + d.data.key.replace(/[\W]+/g, "_");
				else return "No key";
			}).attr("fill", d => {
				while (d.data.height > 1) d = d.parent;
				return color(d.data.key);
			}).classed("cssClassNode enterSelection", true).attr("d", arc).on("mouseover", mouseover).on("mouseout", mouseout).style("opacity", 1).on("click", click)
			nodesGroup.selectAll("path").transition().duration(2000).attrTween("d", arcTweenData)
			selection.append("title").text(tooltip)
		}

		function mouseover(d) {
			var percentage = (100 * d.value / totalSize).toPrecision(3);
			var percentageString = percentage + "%";
			if (percentage < 0.1) {
				percentageString = "< 0.1%";
			}
			d3.select("#percentage").text(percentageString);
			d3.select("#explanation").style("visibility", "");
			var sequenceArray = d.ancestors().reverse();
			sequenceArray.shift(); // remove root node from the array
			updateBreadcrumbs(sequenceArray);
			d3.selectAll("path").style("opacity", 0.1);
			// Then highlight only those that are an ancestor of the current segment.
			grp.selectAll("path").filter(function(node) {
				return (sequenceArray.indexOf(node) >= 0);
			}).style("opacity", 1);
		}

		function mouseout(d) {
			console.log("byeJordan");
			d3.selectAll("path").style("opacity", 1);
		}

		function click(d) {
			console.log(d.data.key)
			if (d.height == 0) clickFunction(d);
			console.log(d);
			node = d;
			nodesGroup.selectAll("path").transition().duration(2000).attrTween("d", arcTweenZoom(d));
		}
		var lastKey = 0;

		function generateUniqueKey(d) {
			if (!d.hasOwnProperty("key")) d.key = ++lastKey;
			return d.key;
		}

		function createNestFormatHierarchyFromFlatDataset(flatDataset, keyFunctions) {
			function applyKey(keyFunction, i) {
				hierarchy = hierarchy.key(keyFunction);
			}
			var hierarchy = d3.nest();
			keyFunctions.forEach(applyKey);
			hierarchy = hierarchy.entries(flatDataset);
			return hierarchy;
		}

		function initializeBreadcrumbTrail() {
			// Add the svg area.
			var trail = d3.select("#sequence").append("svg:svg").attr("width", width).attr("height", 50).attr("id", "trail");
			// Add the label at the end, for the percentage.
			trail.append("svg:text").attr("id", "endlabel").style("fill", "#000");
		}
		// Generate a string that describes the points of a breadcrumb polygon.
		function breadcrumbPoints(d, i) {
			var points = [];
			points.push("0,0");
			points.push(b.w + ",0");
			points.push(b.w + b.t + "," + (b.h / 2));
			points.push(b.w + "," + b.h);
			points.push("0," + b.h);
			if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
				points.push(b.t + "," + (b.h / 2));
			}
			return points.join(" ");
		}
		// Update the breadcrumb trail to show the current sequence and percentage.
		function updateBreadcrumbs(nodeArray, percentageString) {
			// Data join; key function combines name and depth (= position in sequence).
			var trail = d3.select("#trail").selectAll("g").data(nodeArray, function(d) {
				return d.data.name + d.depth;
			});
			// Remove exiting nodes.
			trail.exit().remove();
			// Add breadcrumb and label for entering nodes.
			var entering = trail.enter().append("svg:g");
			entering.append("svg:polygon").attr("points", breadcrumbPoints).attr("fill", d => {
				return color(d.data.key);
			})
			entering.append("svg:text").attr("x", (b.w)).attr("y", b.h / 2).attr("dy", "0.35em").text(function(d) {
				return d.data.key;
			});
			// Merge enter and update selections; set position for all nodes.
			entering.merge(trail).attr("transform", function(d, i) {
				return "translate(" + i * (b.w + b.s) + ", 0)";
			});
			// Now move and update the percentage at the end.
			d3.select("#trail").select("#endlabel").attr("x", (nodeArray.length + 1) * (b.w + b.s)).attr("y", b.h / 2).attr("dy", "0.35em").attr("text-anchor", "middle").text(percentageString);
			// Make the breadcrumb trail visible, if it's hidden.
			d3.select("#trail").style("visibility", "");
		}
		return sunburstObject;
	}