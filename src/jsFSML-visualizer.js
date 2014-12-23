


function initEdgesNodes(parsed){
    var nodes = [];
    var edges = [];
    
    //loop for adding nodes
    for(var i = 0; i < parsed.length; i++){
        var currentState = parsed[i];
        var node = new Object();
        
        node.id = currentState.id;
        //check if current node is initial
        if(currentState.initial){
            node.color = {background: "gray",border: "black"};
            node.level = 0;
        }
        else{
            node.color = {background: "white",border: "black"};
            node.level = 1;
        }
        nodes.push(node);
        //itselfLength is to make edges to itself readable
        var itselfLength = 150;
        //loop for adding edges of current node
        for(var j = 0;j < currentState.transitions.length; j++){
            var currentTransition = currentState.transitions[j];
            var edge = new Object();
            
            if(currentTransition.action != null){
                edge.label = currentTransition.input + "/" + currentTransition.action;
            }
            else{
                edge.label = currentTransition.input;
            }
            edge.from = currentState.id;
        
            if(currentTransition.transitionTo == null){
                edge.to = currentState.id;
                edge.length = itselfLength;
                itselfLength = itselfLength + 50;
            }
            else{
                edge.to = currentTransition.transitionTo;
                edge.length = 250;
            }
            edge.color = "black";
            edges.push(edge);
        }
    }
    return {nodes:nodes, edges:edges};
}

function visualize(id, parsed){
    
    var curveSettings = {dynamic:false, type:"diagonalCross", roundness:0.5};
    var options = {
        dragNetwork:true,
        navigation:false,
        smoothCurves:curveSettings,
        keyboard:true,
        hierarchicalLayout:{
            enabled:true,
            nodeSpacing:150,
            levelSeperation:150},
        edges:{
            style:"arrow"
            
    }};
    var edgesNodes = initEdgesNodes(parsed);
    console.log(edgesNodes);
    var container = $("#"+id);
    container.show();
    var network = new vis.Network(document.getElementById(id), edgesNodes, options);
    scrollAnimation(id);
    
}

function scrollAnimation(id){   
    $('html, body').animate({
        scrollTop: $("#" + id).offset().top
    }, 1000);

}