var _ga = _ga || {}; //ensure that _ga has been initialized
var _gaq = _gaq || [];

/*
 * Define a function on the _ga object that will automatically push events to all the registered trackers
 * It is possible that there is more than one tracker, hence this function
 */

_ga.getEventTrackers_ = function(category, action, opt_label) {

    //console.log("cat: " + category + "; act: " + action + "; opt_l: " + opt_label);
    //console.log(action + "; " + opt_label);
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

    window.spacescout_open_now_filter = false;

    // get all checked checkboxes
    $('#filter_block [type="checkbox"]:checked').each(function () {
        _gaq.push(_ga.getEventTrackers_("Filters", window.default_location+"-"+this.name, this.value));
    });

    // get all checked radio buttons
    $('#filter_block [type="radio"]:checked').each(function () {
        if (this.value === 'open_now') {
            window.spacescout_open_now_filter = true;
        }
        _gaq.push(_ga.getEventTrackers_("Filters", window.default_location+"-"+this.name, this.value));
    });

    // TODO: get all selected dropdowns items
    $('#filter_block option:selected').each(function () {
        // TODO: This next bit is not as awesome as I would like it, basically we're assuming anything with a label attribute is a building - would be nice if that was more robust.
        if (this.parentNode.hasOwnProperty('label')) {
            // push building
            _gaq.push(_ga.getEventTrackers_("Filters", window.default_location+"-building", this.value));
        } else if (window.spacescout_open_now_filter) {
            if (!(this.parentNode.id.indexOf('from') > -1) && !(this.parentNode.id.indexOf('until') > -1)) {
                // push
                _gaq.push(_ga.getEventTrackers_("Filters", window.default_location+"-"+this.parentNode.id, this.value));
            }
        } else {
            // push
            _gaq.push(_ga.getEventTrackers_("Filters", window.default_location+"-"+this.parentNode.id, this.value));
        }
    })

    window.spacescout_open_now_filter = false;

}
