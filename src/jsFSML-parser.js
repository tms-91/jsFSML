
function loadFileSynchronous(url){
	$.ajaxSetup({async:false});
	var response = $.get(url);
	$.ajaxSetup({async:true});
	return response;
}

function createParser(grammarURL) {
	var grammar = loadFileSynchronous(grammarURL).responseText;
	return eval(PEG.buildParser(grammar));
}

function parseInput(parser,input) {
	return parser.parse(input);
}




function checkConstraints(parseTree){
	var checkResults = {};
	checkResults["singleInitial"]=constraintSingleInitial(parseTree);
	checkResults["uniqueIds"]=constraintUniqueID(parseTree);
	checkResults["targetstatesResolvable"]=constraintAllTargetStatesResolvable(parseTree);
	checkResults["inputUniquelyTargetState"]=constraintInputUniquelyDefinesTargetState(parseTree);
	checkResults["allStatesReachable"]=constraintAllStatesReachable(parseTree);

	return checkResults;
}

function constraintSingleInitial(parseTree){
	var foundInitial=false;
	var ret=true;
	var numberStates=parseTree.length;
	var offendingStates=new Array(0);
	for ( var i = 0; i<numberStates;i++){
		if(parseTree[i].initial){
			offendingStates.push(parseTree[i].id);
			if(foundInitial){
				ret=false;
			} else {
				foundInitial=true;
			}
		}
	}
	return {"returnval":ret, "offenders":offendingStates}
}

function constraintUniqueID(parseTree){
	var stateIds=[];
	var offendingStates=[];
	var ret=true;
	var numberStates=parseTree.length;
	for ( var i = 0; i<numberStates;i++){
		var idx=stateIds.indexOf(parseTree[i].id)
		if(idx!=-1){
			offendingStates.push(parseTree[i].id);
			ret=false;
		} else {
			stateIds.push(parseTree[i].id);
		}

	}
	return {"returnval":ret, "offenders":offendingStates}
}

function constraintAllTargetStatesResolvable(parseTree){
	var stateIds=[];
	var offendingStates=[];
	var ret=true;
	var numberStates=parseTree.length;
	for ( var i = 0; i<numberStates;i++){
		var idx=stateIds.indexOf(parseTree[i].id)
		if(idx==-1){
			stateIds.push(parseTree[i].id);
		}
	}

	for ( var i = 0; i<numberStates;i++){
		var numberTransitions=parseTree[i].transitions.length;
		for ( var j = 0; j<numberTransitions;j++){
			if(parseTree[i].transitions[j].transitionTo!=null){
				var idx=stateIds.indexOf(parseTree[i].transitions[j].transitionTo);
				if(idx==-1){
					offendingStates.push(parseTree[i].transitions[j].transitionTo);
					ret=false;
				}
			}
		}
	}

	return {"returnval":ret, "offenders":offendingStates}
}

function constraintInputUniquelyDefinesTargetState(parseTree){

	var offendingStates=[];
	var ret=true;
	var numberStates=parseTree.length;

	for ( var i = 0; i<numberStates;i++){
		var numberTransitions=parseTree[i].transitions.length;
		var inputDestination={};
		for ( var j = 0; j<numberTransitions;j++){
			var transitionTo=parseTree[i].transitions[j].transitionTo;
			var input=parseTree[i].transitions[j].input;
			if(transitionTo==null){
				transitionTo="";
			}
			if(inputDestination[input]==null){
				inputDestination[input]=transitionTo;
			} else{
				if(inputDestination[input]!=transitionTo){
					ret=false;
					offendingStates.push(parseTree[i].id);
				}
			}
		}
	}

	return {"returnval":ret, "offenders":offendingStates}
}

function constraintAllStatesReachable(parseTree){
	var stateIds=[];
	var stateHashmap={};
	var offendingStates=[];
	var reachableStates=[];
	var ret=true;
	var numberStates=parseTree.length;
	var currentPosition=0;

	for ( var i = 0; i<numberStates;i++){
		var idx=stateIds.indexOf(parseTree[i].id)
		if(idx==-1){
			stateIds.push(parseTree[i].id);
			stateHashmap[parseTree[i].id]=parseTree[i];
		}
		if(parseTree[i].initial){
			reachableStates.push(parseTree[i].id);
		}
	}

	if(reachableStates.length==0){
		// no initial state nothing reachable
		return {"returnval":false, "offenders":stateIds}
	}

	while(currentPosition<reachableStates.length){
		var currentState=stateHashmap[reachableStates[currentPosition]];
		//console.log(reachableStates[currentPosition]);
		//console.log(currentState);
		if(currentState==undefined){
			currentPosition++;
			continue;
		}
		for(var i=0;i<currentState.transitions.length;i++){
			var transitionTo=currentState.transitions[i].transitionTo;
			if(transitionTo==null){
				continue;
			}
			var idx=reachableStates.indexOf(transitionTo);
			if(idx==-1){
				reachableStates.push(transitionTo);
			}
		}
		currentPosition++;
	}

	for ( var i = 0; i<numberStates;i++){
		var idx=reachableStates.indexOf(parseTree[i].id)
		if(idx==-1){
			//not reachable
			offendingStates.push(parseTree[i].id);
			ret=false;
		}
	}
	return {"returnval":ret, "offenders":offendingStates}
}

function createCode(parseTree){
	//creating datastructures for later use
	var states = [];
	var initialState=null;
	var transitions={};

	for(var stateNum=0;stateNum<parseTree.length;stateNum++){
		var currentState=parseTree[stateNum];
		states.push(currentState.id);
		if(currentState.initial){
			initialState=currentState.id;
		}
		transitions[currentState.id]=currentState.transitions;
	}

	// loading the template
	var codeTemplate = loadFileSynchronous("src/jsFSML-simulator.template.js").responseText;
	codeTemplate=codeTemplate+"\n";
	var simulatorConfiguration="";
	simulatorConfiguration=simulatorConfiguration+"\n"+"function jsFSML_createSimulator(){\n";
	simulatorConfiguration=simulatorConfiguration+"var sm = new jsFSML_StateManagement("+JSON.stringify(states)+",\""+initialState+"\");\n";
	simulatorConfiguration=simulatorConfiguration+"var tm = new jsFSML_TransitionManagement(sm,"+JSON.stringify(transitions)+");\n";
	simulatorConfiguration=simulatorConfiguration+"return tm;\n}\n";
	return codeTemplate+simulatorConfiguration;
}
