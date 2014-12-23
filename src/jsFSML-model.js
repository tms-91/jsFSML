
// State class
function State (id,initial,transitions) {
	this.id=id;
	if(initial == true){
		this.initial = true;
	} else {
		this.initial = false;
	}
	this.transitions=transitions;
}

//transition class
function Transition(input,action,transitionTo){
	this.input=input;
	this.action=action;
	this.transitionTo=transitionTo;
}