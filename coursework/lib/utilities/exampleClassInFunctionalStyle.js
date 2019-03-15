/*-------------------------------------------------------------------- 
  
   Module: examle 'class' implemented in Bostock's functional style
   Author: Mike Chantler
  
   What it does:
  	Implements an example 'class' that does simple arithmetic on an array of values
  
   Dependencies
  	D3.js v4
  
   Version history
  	v001	18/08/27	mjc	Created.
  
---------------------------------------------------------------------- */

function myClass() { 
	//Here we use a function declaration to imitate a 'class' definition
	//
	//Invoking the function will return an object (myObject)
	//    e.g. newObject = myClass(6)
	//
	//The returned object has attached public and private methods (functions in JavaScript)

	//Declare the main object that will be returned to caller
	var myObject = {};
	
	//=================== PUBLIC FUNCTIONS =========================
	//
	myObject.loadAndProcessData = function (data) {
		//data is an array of values
		console.log("\n\n\n***************** myObject.loadAndProcessData() called ************");
		console.log("   data before processing = ", data)
		console.log("   arithmentFunction1 = " + arithmentFunction1)
		dataset = data.map(arithmentFunction1);
		console.log("   data after processing = ", dataset)
		console.log("return object = ", myObject)

		return myObject; //for method chaining
	}

	myObject.getData = function ( ) {
		//note this getter could be compactly combined with above to provide getter-setter method
		console.log("\n\n\n************** myObject.getData() called ******************")
		console.log("   data = ", dataset)
		return dataset; 
	}
	
	myObject.overrideArithmentFunction1 = function (fn) {
		console.log("\n\n\n*************** myObject.overrideArithmentFunction1(fn) called *********")
		arithmentFunction1 = fn;
		console.log("   arithmentFunction1 now = ", fn)
		console.log("return object = ", myObject)
		return myObject; //for method chaining
	}
	
	//=================== PRIVATE VARIABLES ====================================
	var dataset = [];	
	
	//===================  PRIVATE FUNCTIONS ====================================	
	function unityOperator(d){return d};	
	var arithmentFunction1 = unityOperator;
	
	//=================== INITIALISATION CODE ====================================
	console.log("\n\n\n*****************  myClass() class constructor called ***************")
	console.log("   arithmentFunction1 = ", arithmentFunction1)
	dataset = dataset.map(arithmentFunction1)		
	console.log("   dataset = ", dataset)
	console.log("return object = ", myObject)

	

	
	//================== IMPORTANT do not delete ==================================
	return myObject; // return the main object to the caller to create an instance of the 'class'
	
} //End of barchart() declaration	

