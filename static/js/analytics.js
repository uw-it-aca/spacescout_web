var _ga = _ga || {}; //ensure that _ga has been initialized
var _gaq = _gaq || [];

/*
 * Define a function on the _ga object that will automatically push events to all the registered trackers
 * It is possible that there is more than one tracker, hence this function 
 */  
 
_ga.getEventTrackers_ = function(category, action, opt_label) {  
             
    // we can return this anonnymous function and pass it to the _gaq 
    return function() {
        var trackers = _gat._getTrackers(); //Gets an array of allt he trackers from the _gat object
        for (var i = 0, tracker; tracker = trackers[i]; i++) {

            //Now we have a handle to a tracker, we can send the event to GA
            //The tracker returns a boolean true if the event was successfully tracked, false otherwise
            var result = tracker._trackEvent(category, action, opt_label, 1);
            
            //for debugging the event tracking we can check the return value
            /*if(result) {                        
                console.log("Tracked " + category + " event " + action + " " + opt_label + " successfully"); //log the event to the console.
            } else {
                console.log("Tracking " + category + " event " + action + " " + opt_label +  " FAILED"); //log the event to the console.
            }*/
        }
    };
};            


function trackCheckedFilters()  {
                        
    // get all checked checkboxes
    $('#filter_block [type="checkbox"]:checked').each(function () {
        _gaq.push(_ga.getEventTrackers_("Filter", "Checked", this.id, this.value));
    });
    
    // get all checked radio buttons
    $('#filter_block [type="radio"]:checked').each(function () {
        _gaq.push(_ga.getEventTrackers_("Filter", "Checked", this.id, this.value));
    });
    
    // TODO: get all selected dropdowns items
    /*$('#filter_block option:selected').each(function () {
        _gaq.push(_ga.getEventTrackers_("Filter", "Selected", this.id, this.value));
    })*/
    
}