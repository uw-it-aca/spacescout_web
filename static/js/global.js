(function(g){

	$(document).ready(function() {

	   // check if a map_canvas exists... populate it
    	if ($("#map_canvas").length == 1) {
          initialize();
        }

    	// handle clicking on map centering buttons
        $('#center_all').live('click', function(e){
            alert("this is a global center all");
        });

        $('#center_me').live('click', function(e){
            alert("this is a global center me");
        });

	});

})(this);