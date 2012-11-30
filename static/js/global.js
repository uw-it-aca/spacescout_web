var detailsLat, detailsLon;
var requests = new Array();

// Handlebars helpers
Handlebars.registerHelper('carouselimages', function(spacedata) {
    var space_id = spacedata.id;
    var elements = new Array;
    for (i=0; i < spacedata.images.length; i++) {
        image_id = spacedata.images[i].id;
        image_url = "background:url(/space/" + space_id + "/image/" + image_id + "/thumb/constrain/width:500)";
        div_string = "<div class='carousel-inner-image item'><div class='carousel-inner-image-inner' style='" + image_url + "'>&nbsp;</div></div>"
        elements.push(div_string);
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
    var formatted = {};
    $.each(hours, function(day) {
        if (hours[day].length > 0) {
            $.each(hours[day], function() {
                this[0] = this[0].replace(/^0+/, '');
                this[1] = this[1].replace(/^0+/, '');
            });
            dayMarker = day.charAt(0);
            dayMarker = dayMarker.toUpperCase();
            // Show two characters for Th, Sa, Su
            if (dayMarker == 'T' && day.charAt(1) == 'h' || dayMarker == 'S' && day.charAt(1) == 'a' || dayMarker == 'S' && day.charAt(1) == 'u') {
                dayMarker += day.charAt(1);
            }
            
            formatted[dayMarker] = to12Hour(hours[day]).join(", ");
        }
    });
    formatted = sortDays(formatted);
    formatted = groupHours(formatted);
    return new Handlebars.SafeString(formatted.join("<br/>"));
});

function groupHours(days) {
    var days1 = [];
    var hours = [];
    var days2 = [];
    var daycount =0;
    var hourscount = 0;
    var final_hours = [];
    var final_hours_count=0;
    
    for(var i=0;i < days.length; i++) {
        var split = days[i].split(": ");
        var day = split[0];
        var hours1 = split[1].split(", ");
        for(hour in hours1) {
            days1[daycount]=day;
            if(day == "M") {
                days2[daycount]=0; 
            }else if(day == "T") {
                days2[daycount]=1; 
            }else if(day == "W") {
                days2[daycount]=2;
            }else if(day == "Th") {
                days2[daycount]=3;
            }else if(day == "F") {
                days2[daycount]=4;
            }else if(day == "Sa") {
                days2[daycount]=5;
            }else if(day == "Su") {
                days2[daycount]=6;
            }
            hours[hourscount]= hours1[hour];
            daycount++;
            hourscount++;
        }

    }
    
    for(var i=0; i<hours.length; i++) {
        var hour = hours[i].split(" - ");
        
        if(hours[i] != "Open 24 Hours"&& hour[1]=="Midnight") {
            var next_day = "null";
            if(i != hours.length-1) {
                for( var j=i+1; j<hours.length; j++) {
                    var new_hour=hours[j].split(" - ");
                    if((days2[j]-days2[i])> 1) {
                        break;
                    }
                    if((days2[j]-days2[i])== 1 && new_hour[0]=="12AM") {
                        hour[1]=new_hour[1];
                        hours[j]="null";
                        break;
                    }
                }
                hours[i]=hour[0]+" - "+ hour[1];
            }else if( days1[i] == "Su") {
                for( var j=0; j<hours.length; j++) {
                    var new_hour=hours[j].split(" - ");
                    if((days2[j]-days2[i])!= -6) {
                        break;
                    }
                    if((days2[j]-days2[i])==-6 && new_hour[0]=="12AM") {   
                        hour[1]=new_hour[1];
                        hours[j]="null";
                        break;
                    }
                }
                hours[i]=hour[0]+" - "+ hour[1];
            }
        }
    }
    
    for(var i=0; i<hours.length; i++) {
        if (hours[i] != "null" && i != hours.length-1) {
            for(var j =i+1; j<hours.length; j++) {
                
                if(hours[i]==hours[j]) {
                    days1[i]+= ", "+days1[j];
                    hours[j]="null";
                }
            }
        }
    }
    for(var i=0; i<hours.length; i++) {
        if( hours[i] != "null") {
            final_hours[final_hours_count]=days1[i]+": "+ hours[i];
            final_hours_count++;
        }
    }
    return final_hours;
}

function to12Hour(day) {
    var retData = [];
    for (var j=0; j<day.length; j++) {
        var data = [ day[j][0], day[j][1] ];
        for (var i=0; i<data.length; i++) {
            time = data[i].split(":");
            if(time[0]=="23" & time[1] == "59") {
                data[i] = "Midnight";
            }
            else if (time[0] =="12" & time[1] =="00") {
                data[i] = "Noon";
            }else {
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
                if (time[1] == "00AM") {
                    data[i] = time[0];
                    data[i] += "AM";
                } else if (time[1] == "00PM") {
                    data[i] = time[0];
                    data[i] += "PM"
                }else {
                    data[i] = time.join(":");
                }
            }
        }
        if(data[0]=="12AM" & data[1]=="Midnight") {
            retData[j]="Open 24 Hours";
        }else {
            retData[j]=data[0] +" - " +data[1];
        }
    }
    return retData;
}

function sortDays(days) {
    var ordered = [];
    order = ["M", "T", "W", "Th", "F", "Sa", "Su"];
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

// Found at http://stackoverflow.com/questions/476679/preloading-images-with-jquery
function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
        // Alternatively you could use:
        // (new Image()).src = this;
    });
}

(function(g){

	$(document).ready(function() {

        var pinimgs = ['/static/img/pins/pin00.png', '/static/img/pins/pin01.png'];
        preload(pinimgs);

        // handle changing of the location select
        $('#location_select').change(function() {
            window.default_latitude = $(this).val().split(',')[0];
            window.default_longitude = $(this).val().split(',')[1];
            // in case a new location gets selected before the map loads
            if (window.spacescout_map != null) {
                window.spacescout_map.setCenter(new google.maps.LatLng(window.default_latitude, window.default_longitude));
            }
        });

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

function replaceUrls(){
    // Replace urls in reservation notes with actual links.
    var text = $("#ei_reservation_notes").html();
    var patt = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
    var url = patt.exec(text);
    if (url != null) {
        text = text.replace(url, "<a href='" + url + "'>" + url + "</a>");
        $("#ei_reservation_notes").html(text);
    }
}
