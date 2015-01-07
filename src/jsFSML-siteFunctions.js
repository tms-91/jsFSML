$('document').ready(function(){
    $("#parse-btn").click(buttonClick);

});

function buttonClick() {
	//console.log(JSON.stringify(parseInput(createParser("src/fsml_grammar.txt"),$("#input").val())), null, 4);
        $("#feedback").val("");
	var parsed = parseInput(createParser("src/fsml_grammar.txt"),$("#input").val());
        console.log(parsed);
	console.log("CHECKS:");
	var constraintResults=checkConstraints(parsed);
	if(printConstraintResults(constraintResults,"#feedback")){
		feedback("parsing complete");
		visualize("result", parsed);
		jsFSML_parseTree=parsed; // create a global variable for later acces
		$("#export-btn").click(downloadCode);
		$("#simulation-btn").click(startSimulation);
	}
}


function feedback(text){
    var feedback = $("#feedback");
    feedback.val(feedback.val() + text);
}


function printConstraintResults(constraintResult,printTo){
	var ret=true;
	var val=$(printTo).val()+"\n";

	if(constraintResult["singleInitial"].returnval==false){
		console.log("multiple initial states detected! offenders: "+JSON.stringify(constraintResult["singleInitial"].offenders));
		val+="multiple initial states detected! offenders: "+JSON.stringify(constraintResult["singleInitial"].offenders)+"\n";
		ret=false;
	}
	if(constraintResult["uniqueIds"].returnval==false){
		console.log("non unique ids for states detected! offenders: "+JSON.stringify(constraintResult["uniqueIds"].offenders));
		val+="non unique ids for states detected! offenders: "+JSON.stringify(constraintResult["uniqueIds"].offenders)+"\n";
		ret=false;
	}
	if(constraintResult["targetstatesResolvable"].returnval==false){
		console.log("non resolvable states detected! offenders: "+JSON.stringify(constraintResult["targetstatesResolvable"].offenders));
		val+="non resolvable states detected! offenders: "+JSON.stringify(constraintResult["targetstatesResolvable"].offenders)+"\n";
		ret=false;
	}
	if(constraintResult["inputUniquelyTargetState"].returnval==false){
		console.log("multiple target states for same input detected! offenders: "+JSON.stringify(constraintResult["inputUniquelyTargetState"].offenders));
		val+="multiple target states for same input detected! offenders: "+JSON.stringify(constraintResult["inputUniquelyTargetState"].offenders)+"\n";
		ret=false;
	}
	if(constraintResult["allStatesReachable"].returnval==false){
		console.log("non reachable states detected! offenders: "+JSON.stringify(constraintResult["allStatesReachable"].offenders));
		val+="non reachable states detected! offenders: "+JSON.stringify(constraintResult["allStatesReachable"].offenders)+"\n";
		ret=false;
	}

	$(printTo).val(val);

	return ret;
}


function downloadCode(){
	if((jsFSML_parseTree==undefined)||(jsFSML_parseTree==null)){
		return;
	} else {
		var download = window.document.createElement("a");
		var code = createCode(jsFSML_parseTree);
		download.href = window.URL.createObjectURL(new Blob([code],{type: "text/javascript"}));
		download.download="jsFSML_Simulation_Implementation.js";
		document.body.appendChild(download);
		download.click();
		document.body.removeChild(download);
	}
}

function startSimulation(){
	if((jsFSML_parseTree==undefined)||(jsFSML_parseTree==null)){
		return;
	} else {
		var code = createCode(jsFSML_parseTree);
		var buttonArea=$("#sim-buttons");
		eval(code);
		simulation=jsFSML_createSimulator();
		currentSimulationNode=simulation.getStateManagement().getCurrentState();
		currentSimulationNodeColour=getNodeColour(currentSimulationNode);
		changeNodeColour(currentSimulationNode,"red");
		var inputs=simulation.getInputs();
		if(inputs.length>0){
			for(var i=0;i<inputs.length;i++){
				var currentInput=inputs[i];
				var button = window.document.createElement("div");
				button.classList.add("action-btn");
				button.classList.add("no-select");
				button.classList.add("sim-btns");
				button.id="sim-btn-"+currentInput;
				var currentInput2="\""+currentInput+"\"";
				eval("function temp(){function c(){simulationButtonHandler ("+currentInput2+");} return c;}");
				var btnfunc = temp();
				button.innerHTML=currentInput;
				buttonArea.append(button);
				$("#"+button.id).click(btnfunc);

			}
		}
	}
}
function simulationButtonHandler(value){
	simulation.enter_input(value);
	var currentNode=simulation.getStateManagement().getCurrentState();
	if(currentNode!=currentSimulationNode){
		changeNodeColour(currentSimulationNode,currentSimulationNodeColour);
		currentSimulationNodeColour=getNodeColour(currentNode);
		currentSimulationNode=currentNode
		changeNodeColour(currentSimulationNode,"red");
	}
}