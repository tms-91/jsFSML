$('document').ready(function(){
    $("#parse-btn").click(buttonClick);
    
});

function createParser(grammarURL) {
	$.ajaxSetup({async:false});
	var grammar = $.get(grammarURL).responseText;
        
     
	$.ajaxSetup({async:true});
	//alert(grammar.responseText);
	return eval(PEG.buildParser(grammar));
}

function parseInput(parser,input) {
	return parser.parse(input);
}

function buttonClick() {
	//console.log(JSON.stringify(parseInput(createParser("src/fsml_grammar.txt"),$("#input").val())), null, 4);
        var parsed = parseInput(createParser("src/fsml_grammar.txt"),$("#input").val());
        console.log(parsed);
        visualize("result", parsed);
}

function feedback(text){
    var feedback = $("#feedback");
    feedback.valueOf(feedback.val() + text);
}




