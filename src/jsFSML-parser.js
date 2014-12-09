

function createParser(grammarURL) {
	$.ajaxSetup({async:false});
	var grammar = $.get(grammarURL).responseText;

	$.ajaxSetup({async:true});
	alert(grammar.responseText);
	return eval(PEG.buildParser(grammar));
}

function parseInput(parser,input) {
	return parser.parse(input);
}

function test() {
	alert($("#input").val());
	alert(JSON.stringify(parseInput(createParser("src/fsml_grammar.txt"),$("#input").val())), null, 4);
}