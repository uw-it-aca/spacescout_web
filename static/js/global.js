var requests = new Array();
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

function replaceUrls(){
    // Replace urls in reservation notes with actual links.
    var text = $("#ei_reservation_notes").html();
    var patt = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
    var url = patt.exec(text);
    if (url != null) {
        text = text.replace(url, "<a href='" + url + "'>" + url + "</a>");
        alert(text);
        $("#ei_reservation_notes").html(text);
    }
}
