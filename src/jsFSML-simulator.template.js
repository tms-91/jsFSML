// State Management -- remembering the current state and transitioning to only known states
function jsFSML_StateManagement(states,initialState){

	this.states=states;// array of strings
	this.currentState=initialState;// string
}

jsFSML_StateManagement.prototype.getCurrentState = function (){
	return this.currentState;
}

jsFSML_StateManagement.prototype.setCurrentState = function (newState){
	var idx=this.states.indexOf(newState);
	if(idx==-1){
		return false;
	} else {
		this.currentState=newState;
		return true;
	}
}

jsFSML_StateManagement.prototype.getStates = function (){
	return this.states;
}

// Transition Management
function jsFSML_TransitionManagement(stateManagement,transitionRules){
	this.stateManagement=stateManagement; // reference to the state management so we dont have to pass it as a parameter every time ;)

	// contains action listeners that are called on specific transitions if available. format is function()
	this.actionListeners={};



	// this will hold the datastructure containing the transition rules; format: {"id":[rule_for_id]}
	this.transitionRules=transitionRules;

	//these two arrays are for making sure our inputs are sane
	this.input=[];
	this.actions=[];

	for (var state in transitionRules){
		if (Object.prototype.hasOwnProperty.call(transitionRules, state)) {
    			if(transitionRules[state] instanceof Array){
				if(transitionRules[state].length>0){
					for(var i=0;i<transitionRules[state].length;i++){
						var input = transitionRules[state][i].input;
						var action = transitionRules[state][i].action;

						if(this.input.indexOf(input)==-1){
							this.input.push(input);
						}

						if(action!=null){
							if(this.actions.indexOf(action)==-1){
								this.actions.push(action);
							}
						}
					}
				}
			}
  		}
	}
}

jsFSML_TransitionManagement.prototype.getStateManagement = function (){
	return this.stateManagement;
}

jsFSML_TransitionManagement.prototype.getInputs = function (){
	return this.input;
}

jsFSML_TransitionManagement.prototype.getActions = function (){
	return this.input;
}

jsFSML_TransitionManagement.prototype.setActionListener = function (action,functionCallback){
	var idx=this.actions.indexOf(action);
	if(idx==-1){
		return false;
	} else {
		this.actionListeners[action]=functionCallback;
		return true;
	}
}

jsFSML_TransitionManagement.prototype.input = function (input){
	var idx=this.input.indexOf(input);
	if(idx==-1){
		// unknown input
		return false;
	} else {
		//valid input
		var currentState = this.stateManagement.getCurrentState();
		var rulesOfConcern = this.transitionRules[currentState]; // rules of the current State
		var appliedRules=[]; // rules of current state for input

		// get rules of current state for input
		for( var i=0;i<rulesOfConcern.length;i++){
			if(reulesOfConcern[i].input==input){
				appliedRules.push(rulesOfConcern[i]);
			}
		}


		if(appliedRules.length==0){
			// no rule for input nothing to do :/
			return true;
		} else {
			// we have rules for input
			var transitionTo=null;
			var actions=[]; // later executed actions

			for( var i=0;i<appliedRules.length;i++){
				if(appliedRules[i].action!=null){ // get all the actions for the input in current State
					actions.push(appliedRules[i].action);
				}
				if(appliedRules[i].transitionTo!=null){// get the state to transition to make sure we do not have two states (SHOULD NOT HAPPEN!!!)
					if(transitionTo==null){
						transitionTo=appliedRules[i].transitionTo;
					} else if(appliedRules[i].transitionTo!=transitionTo) {
						// I DONT KNOW WHAT TO DO HOOMAN HALP!!
						return false;
					}
				}
			}

			// execute actions with the listener functions
			if(actions.length!=0){
				for( var i=0;i<actions.length;i++){
					if(this.actionListeners[actions[i]] instanceof Function){
						this.actionListeners[actions[i]]();
					}
				}
			}

			// transition state
			if(transitionTo!=null){
				if(this.stateManagement.setCurrentState(transitionTo)){
					console.log("transitioned from <"+currentState+"> to <"+transitionTo+">!");
				}
			}
			return true;
		}

	}
}