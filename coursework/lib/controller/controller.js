
var dm1 = modelConstructor();
var dataModel; 
var scatter3;
var pie2;
var bc3;
var bc4;
var tr2;
//=============== READ DATA FILES ================================
d3.queue()
  .defer(d3.csv, "data/topics/REF2014T30TopicOrder.csv")
  .defer(d3.csv, "data/290183_REF_Contextual_table_1314_0.csv")
  .defer(d3.csv, "data/learning-providers-plus.csv")
  .defer(d3.json, "data/topics/REF2014T30Python.json")
  .await(initialiseApp)
//======================== MAIN FUNCTION =================================
//Carries out all initialization and setup
function initialiseApp(error, ref14data, ref14context , learningProviders, jsonTopicData){
//Check data files have loaded
  if (error) {console.log (" there are errror with loading the data: ", error); return;}

  dm1.loadData(ref14data, ref14context , learningProviders, jsonTopicData)
  dataModel = dm1.model();

  var nest2 = d3.nest()
  .key(refEntry => refEntry["Main panel"])
  .sortKeys(d3.ascending)
  .key(refEntry => refEntry["UoAString"])
  .sortKeys(d3.ascending)
  .rollup(values => values)
  .entries(dataModel.refEntries);

  tr2 = sunburst("#sunburstDiv2")
    .appendClickFunction(treeClickFunction2)
    .overrideTooltipFunction(["hello"])
    .loadAndRenderNestDataset(nest2, "REF")

  scatter3 = scatterchart("#scatterchart3Div")
    .overrideDataFieldFunction(e => Number(e.context["scaledFTE"]))
    .overrideKeyFunction(e => e["Institution name"])
    .overrideMouseClickFunction(clickScatter)
    .overrideTooltipFunction(e => {return e["Institution name"] + ", " +  e.UoAString + ", 4* = " + e.context["scaledFTE"];})
    .maxValueOfDataField(300); 

  bc3 = barchart("#barchart3Div")
    .overrideDataFieldFunction(e => Number(e.environment["4*"]))
    .overrideKeyFunction(e => e["Institution name"])
    .overrideMouseClickFunction(clickScatter)
    .overrideTooltipFunction(e => {return e["Institution name"] + ", " +  e.UoAString + ", 4* = " + e["UoAValue"];})
    .maxValueOfDataField(100); 

  bc4 = barchart("#barchart4Div")
  .maxValueOfDataField(0.5); 

  pie2 = piechart("#piechartdiv2")
    .overrideDataFieldFunction(e => Number(e.environment["WordCount"]))
}   


function renderTopicData(topic){

    var bc3Data = dataModel.refEntries
    .filter(e => e["UoAString"] == topic) 
    .filter(e => e.environment["4*"] ) 
    .sort(function(a, b){return a["Institution name"] > b["Institution name"]})

    var scatter3Data = dataModel.refEntries
    .filter(e => e["UoAString"] == topic) 
    .filter(e => e.environment["4*"] ) 
    .filter(e => e.context["scaledFTE"] ) 
    .sort(function(a, b){return a["Institution name"] > b["Institution name"]})

    var pie2Data = dataModel.refEntries
     .filter(e => e["UoAString"] == topic) 
    .filter(e => e.environment["4*"] ) 
    .sort(function(a, b){return a["Institution name"] > b["Institution name"]})
    
  bc3.loadAndRenderDataset(bc3Data);
  pie2.loadAndRenderDataset(pie2Data);
  scatter3.loadAndRenderDataset(scatter3Data);
}

function renderTopicWeights(click){
    console.log("hello dickhead")
    var bc4Data = click
    .filter(e => e["UoAString"] == topic) 
    .filter(e => e.environment["4*"] ) 
    .sort(function(a, b){return a["Institution name"] > b["Institution name"]})


}

function treeClickFunction2(d){
  //If leaf node then user has clicked on a University
  //so render that university's data in a barchart 
  if (d.height == 0) { 
    console.log("tree click, d.height, d = ", d.data.key)
    var topic = d.data.key;
    renderTopicData(topic)
    }
}

function clickScatter(d){
   var unitOfAssessment = d.UoAString;
   console.log(unitOfAssessment)
   var click = d.environment.topicsAsArray
   console.log(click)

   renderTopicWeights(click)

}



function renderTopicWeights(clickedPoint){
  console.log("im here")
    console.log(clickedPoint)
    bc4.loadAndRenderDataset(clickedPoint)
}





