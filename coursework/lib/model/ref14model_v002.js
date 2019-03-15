/*-------------------------------------------------------------------- 
  
   Module: data model class implemented in Bostock's functional style
   Author: Mike Chantler
  
   What it does:
  	Processes csv files to provide two flat arrays of objects:
	    refEntries[ ] - one entry (array element) for each unique institution/UoA combinations
		topics[ ] - one entry for each topic
		asocIndex{} - associative index to topics[ ]  
  
   Dependencies
  	D3.js v4
  
   Version history
  	v001	17/09/2017	mjc	Created.
  	v002	05/08/2018	mjc	Added topic processing.
  
---------------------------------------------------------------------- */

"use strict";
function modelConstructor() { 
	//Here we use a function declaration to imitate a 'class' constructor
	//
	//Invoking the function will return an object (modelObject) with the public
	// methods listed below
	//    e.g. model1 = modelConstructor()
	//
	

	//====Declare the main object that will be returned to caller ============
	//
	var modelObject = {};
	
	//=================== PUBLIC FUNCTIONS =========================
	//
	modelObject.loadData = function (csvRef14data, ref14context, learningProviders, jsonTopicData) {
		var processedTopics = processTopicData(jsonTopicData);
		dataModel.topics = processedTopics.topics;
		dataModel.topicsAsocIndex = processedTopics.asocIndex;
		dataModel.refEntries = joinREFandLP(csvRef14data, ref14context, learningProviders, processedTopics.listOf3wordTopicsAsArray);
		return modelObject; //For chaining
	}
	
	modelObject.addBasicTopicArrayData = function (trueOrFalse) {
		//Set to true to get easier to process "topicWeights" computed as ref14entry.topicsAsArray[]
		addBasicTopicArrayData = trueOrFalse;
		console.log("addBasicTopicArrayData = ", addBasicTopicArrayData);
		return modelObject; //For chaining
	}
	
	modelObject.model = function (){return dataModel}
	

	
	
	
	//=================== PRIVATE VARIABLES ====================================

	var dataModel = {};
	var ref14data;
	var learningProviders;
	var listOf3wordTopicsAsArray = [];
	var topicDataAs3Arrays={}; //old format
	var addBasicTopicArrayData = true;

	//=================== CONSTRUCTOR CODE ====================================
	// -- nothing at the moment


	//======================== PRIVATE FUNCTIONS =================================
	
	function processTopicData(tData){
		//===================== Convert obj format to array format ===================
		//
		// data returned as an array where each element is an object containing all the data 
		// on one topic, obj = {wordCloudAsArray, documents, similarities }
		//
		// (topicDataAs3Arrays is alternative format compatible with old code)
		//
		var topics = []; //Used to accumulate Return object
		var oTopics = tData.topics; //Object form of topic
		topicDataAs3Arrays.topics = [];  //Old format
		
		//Process the topics' words
		for (var key in oTopics) {
			topicDataAs3Arrays.topics[Number(key)] = oTopics[key]; //old format 
			
			//New format
			topics[Number(key)]={"topicNumber":Number(key)}
			topics[Number(key)].words = {} //obj to store all word stuff
			
			var words = oTopics[key].map(obj => obj.label);
			var weights = oTopics[key].map(obj => obj.weight);
			topics[Number(key)].words.first3words = words[0] + "-" + words[1] + "-" + words[2];
			//topics[Number(key)].words.wordList = words;
			//topics[Number(key)].words.wordWeights = weights;
			topics[Number(key)].words.wordCloudAsArrayOfObjects=oTopics[key];
		}

		//Process the topics' top 100 documents
		var topicsDocsDistrib = tData.topicsDocsDistrib; //Object form of topic	
		topicDataAs3Arrays.topicsDocsDistrib = [];  //This is where we will store the array form
		for (var key in topicsDocsDistrib) {
			topicDataAs3Arrays.topicsDocsDistrib[Number(key)] = topicsDocsDistrib[key];
			topics[Number(key)].topDocuments={}; //container for docs info
			//topics[Number(key)].topDocuments.docList=topicsDocsDistrib[key].map(d => d.docID);
			//topics[Number(key)].topDocuments.topicWeights=topicsDocsDistrib[key].map(d => d.topicWeight);
			topics[Number(key)].topDocuments.fullInfo=topicsDocsDistrib[key];
		}

		//Process the Topics' similarities
		var oSimilarities = tData.topicsSimilarities; //Object form of topic similarities	
		topicDataAs3Arrays.topicsSimilarities = [];  //This is where we will store the array form
		for (var key in oSimilarities) {
			topicDataAs3Arrays.topicsSimilarities[Number(key)] = [];
			for (var key2 in oSimilarities[key]) {
				topicDataAs3Arrays.topicsSimilarities[Number(key)][Number(key2)] 
					= oSimilarities[key][key2]
			}
			topics[Number(key)].similarities=topicDataAs3Arrays.topicsSimilarities[Number(key)]
		}
		var asociativeTopic3worIndex={}
		topics.forEach((element, index, array) => {
			var f3w = element.words.first3words;
			asociativeTopic3worIndex[f3w] = element;
		});
		
		listOf3wordTopicsAsArray = [];
		topics.forEach(function(topic){
			listOf3wordTopicsAsArray[topic.topicNumber] = topic.words.first3words;
		})
		
		return {"topics":topics, "asocIndex":asociativeTopic3worIndex, "listOf3wordTopicsAsArray": listOf3wordTopicsAsArray}
	}

	function joinREFandLP(ref14data, ref14context, learningProviders, listOf3wordTopicsAsArray){
		//Merge the REF and Learning Provider tables into a single table
		//by extending the REF data
		var learningProvider, ref14entry, lpP, refP;
		
		//Step through all REF14 entries adding in LP and Context info.
		ref14data.forEach(function(ref14entry) {
			ref14entry.environment = {}
			
/*			//Reformat topic weights as topic vector
			ref14entry.environment.topicVector = [];
			ref14entry.topicNames = listOf3wordTopicsAsArray;
			listOf3wordTopicsAsArray.forEach(function(threeWordTopic, i){
				ref14entry.environment.topicVector[i] = ref14entry[threeWordTopic]
			})*/
			
			
			//Tidy some of the representation
			ref14entry.UoAString = ref14entry.UoAString.trim();			
			
			//Stick multiple submission letter back on if there is one
			var lastLetter = ref14entry.DocumentID.slice(-1) ;
			if (lastLetter == "-" ) {
				ref14entry["Multiple submission letter"] = "";		
				ref14entry["UoAString with Multiple submission letter appended"] = ref14entry.UoAString;				
			} else {
				ref14entry["Multiple submission letter"] = lastLetter;
				ref14entry["UoAString with Multiple submission letter appended"] = (ref14entry.UoAString + " - " + lastLetter);	
			}
			
			//Change some numeric text fields into Numbers and put environment data into one object
			ref14entry.environment["4*"] = Number(ref14entry["4*"]); delete ref14entry["4*"];
			ref14entry.environment["3*"] = Number(ref14entry["3*"]); delete ref14entry["3*"];
			ref14entry.environment["2*"] = Number(ref14entry["2*"]); delete ref14entry["2*"];
			ref14entry.environment["1*"] = Number(ref14entry["1*"]); delete ref14entry["1*"];
			ref14entry.environment.unclassified = Number(ref14entry.unclassified);	 delete ref14entry.unclassified;
			
			ref14entry.environment.WordCount = Number(ref14entry.WordCount);  delete ref14entry.WordCount;
			ref14entry.environment.TextUsed = ref14entry.TextUsed;  delete ref14entry.TextUsed;
			ref14entry.environment.IncludedInTopicModel = ref14entry.IncludedInTopicModel;  delete ref14entry.IncludedInTopicModel;
			ref14entry.environment.ReasonForRemoval = ref14entry.ReasonForRemoval;  delete ref14entry.ReasonForRemoval;
			ref14entry.environment.URL = ref14entry.URL;  delete ref14entry.URL;

			//Process topic weights
			ref14entry.environment.topicWeights = {}
			if(addBasicTopicArrayData) ref14entry.environment.topicsAsArray = [];
			listOf3wordTopicsAsArray.forEach(function(topicAs3Word){
				ref14entry.environment.topicWeights[topicAs3Word] = Number(ref14entry[topicAs3Word])
				
				var topicObj ={}
				topicObj.topicAs3words = topicAs3Word;
				topicObj.weight = Number(ref14entry[topicAs3Word]);
				
				if(addBasicTopicArrayData) ref14entry.environment.topicsAsArray.push(topicObj);
				delete ref14entry[topicAs3Word]
			});
			
			//Step through all learningProviders
			learningProviders.forEach(function(learningProvider) {
				//assign LP info to REF14 entry if match
				if (ref14entry["Institution code (UKPRN)"] == learningProvider.UKPRN)
						ref14entry.lp = learningProvider;
						if (ref14entry.lp ){ //Change geo data into Numbers
							ref14entry.lp.LONGITUDE = Number(ref14entry.lp.LONGITUDE)
							ref14entry.lp.LATITUDE = Number(ref14entry.lp.LATITUDE)
							ref14entry.lp.EASTING = Number(ref14entry.lp.EASTING)
							ref14entry.lp.NORTHING = Number(ref14entry.lp.NORTHING)
						}
			});	

			//Step through all ref14context entries and assign to relevant REF entry
			ref14context.forEach(function(ref14contextEntry) {
				//assign LP info to REF14 entry if match
				if (ref14entry["Institution code (UKPRN)"] == ref14contextEntry.UKPRN
					&& ref14entry["UoAValue"] == ref14contextEntry["Unit of \nassessment number"]
				)
				{					
//					ref14entry.fullContext=ref14contextEntry;	
					ref14entry.context={};	
					ref14entry.context.scaledFTE = Number(ref14contextEntry["Scaled FTE \nof eligible staff"]);	
					ref14entry.context.regionProvider = ref14contextEntry[ "Region \nof provider"];	
					ref14entry.context["Unit of assessment name"] = ref14contextEntry["Unit of assessment name"];	
				}
			});	
		});
		
		//Find all REF institutions not in the Learning Providers table
		var notInLP = ref14data.filter(ref14entry => !ref14entry.lp)
		if(notInLP.length > 0) console.log("\nWARNING " + notInLP.length +" dataModel.refEntries have no lp data and have been removed:\n", notInLP)
		
		//Find all REF institutions, UoA combinations without context
		var noContext = ref14data.filter(ref14entry => !ref14entry.context)
		if(noContext.length > 0) console.log("\nWARNING the following dataModel.refEntries have no context and have been removed:\n", noContext, "\n")
		
		//Find all REF institutions, UoA combinations without numbers in 4*, 3* etc gradings
		var noStarRating = ref14data.filter(ref14entry => isNaN(ref14entry.environment["4*"])		)
		if(noStarRating.length > 0) console.log("\nWARNING the following dataModel.refEntries have no 4* rating, and have been removed:\n", noStarRating, "\n")

		//Clean table of non-complete entries
		ref14data = ref14data.filter(ref14entry => ref14entry.lp)
		ref14data = ref14data.filter(ref14entry => ref14entry.context)
		ref14data = ref14data.filter(ref14entry => !isNaN(ref14entry.environment["4*"]))
			
		return ref14data;
	}
	
	//================== IMPORTANT do not delete ==================================
	return modelObject; // return the main object to the caller to create an instance of the 'class'
	
} //End of model() declaration	

