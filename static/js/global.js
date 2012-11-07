var detailsLat, detailsLon;
var requests = new Array();

// Handlebars helpers
Handlebars.registerHelper('carouselimages', function(spacedata) {
    var space_id = spacedata.id;
    var elements = new Array;
    for (i=0; i < spacedata.images.length; i++) {
        image_id = spacedata.images[i].id;
        elements.push('<div class="item"><img src="/space/'+space_id+'/image/'+image_id+'/thumb/constrain/width:500,height:333" class="img"></div>');
    }
    return new Handlebars.SafeString(elements.join('\n'));
});

Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    operator = options.hash.operator || "==";

    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

Handlebars.registerHelper('formatHours', function(hours) {
    //tomorrow_starts_at_midnight = true;
    //tomorrow_is_24_hours =
    //if (start_time[0] == 0 && start_time[1] == 0 && end_time[0] == 23 && end_time[1] == 59 && tomorrow_starts_at_midnight && !tomorrow_is_24_hours && tomorrows_hour > 3) {
        //dsf
    //}
    var formatted = [];
    $.each(hours, function(day) {
        if (hours[day].length > 0) {
            dayMarker = day.charAt(0);
            dayMarker = dayMarker.toUpperCase();
            if (dayMarker == 'T' && day.charAt(1) == 'h' || dayMarker == 'S' && day.charAt(1) == 'u') {
                dayMarker += day.charAt(1);
            }
            formatted[dayMarker] = to12Hour(hours[day]);
        }
    });
    formatted = sortDays(formatted);
    return new Handlebars.SafeString(formatted.join("<br/>"));
});

function to12Hour(day) {
    var data = [ day[0][0], day[0][1] ];
    for (var i=0; i<data.length; i++) {
        time = data[i].split(":");
        if (time[0] > 12) {
            time[0] -= 12;
            time[1] += "PM";
        }
        else if (time[0] < 1) {
            time[0] = 12;
            time[1] += "AM";
        }
        else {
            time[1] += "AM";
        }
        data[i] = time.join(":");
    }
    return data[0] +" - " +data[1];
}

function sortDays(days) {
    var ordered = [];
    order = ["M", "T", "W", "Th", "F", "S", "Su"];
    $.each(order, function(day) {
        if (days[order[day]]) {
            ordered.push(order[day] +": " +days[order[day]] );
        }
    });
    return ordered;
}

function default_open_at_filter() {
    // set the default open_at filter to close to now
    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var date = new Date();
    var hour = date.getHours();
    var min = date.getMinutes();

    if (min < 16) {
        min = "00";
    }else if (min < 46) {
        min = "30";
    }else {
        min = "00";
        hour++;
    }

    if (hour > 11) {
        $("#ampm-from").val("PM");
    }else {
        $("#ampm-from").val("AM");
    }
    if (hour > 12) {
        hour = hour-12;
    }
    hour = ""+hour+":"+min;
    $("#day-from").val(weekdays[date.getDay()]);
    $("#hour-from").val(hour);
}

(function(g){

	$(document).ready(function() {

    	// handle clicking on map centering buttons
        $('#center_all').live('click', function(e){

            e.preventDefault();
            if (window.spacescout_map.getZoom() != window.default_zoom) {
                window.spacescout_map.setZoom(window.default_zoom);
            }
            window.spacescout_map.setCenter(new google.maps.LatLng(window.default_latitude, window.default_longitude));
        });

        // handle clicking on the "done" button for filters
        $("#view_results_button").click(function() {
            $('.count').hide();
            $('.spaces').hide();
            run_custom_search();
        });

        default_open_at_filter();

	});

})(this);

function getSpaceMap(lat, lon) {

  if (window.space_latitude) {
    lat = window.space_latitude
  }

  if (window.space_longitude) {
    lon = window.space_longitude
  }

  var mapOptions = {
    zoom: 17,
    center: new google.maps.LatLng(lat , lon),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false
  }

  var map = new google.maps.Map(document.getElementById("spaceMap"), mapOptions);

  var image = '/static/img/pins/pin00.png';

  var spaceLatLng = new google.maps.LatLng(lat , lon);
  var spaceMarker = new google.maps.Marker({
      position: spaceLatLng,
      map: map,
      icon: image
  });

}
