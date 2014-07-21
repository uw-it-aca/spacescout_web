/*
    Copyright 2012 UW Information Technology, University of Washington

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

*/

var requests = [];

// Handlebars helpers
Handlebars.registerHelper('carouselimages', function(spacedata) {
    var space_id = spacedata.id;
    var elements = [];
    if (spacedata.images.length > 0) {
        for (i=0; i < spacedata.images.length; i++) {
            image_id = spacedata.images[i].id;
            image_url = "background:url(/image/space/" + space_id + "/" + image_id + "/thumb/constrain/width:500)";
            div_string = "<div class='carousel-inner-image item'><div class='carousel-inner-image-inner' style='" + image_url + "'>&nbsp;</div></div>";
            elements.push(div_string);
        }
    } else {
        div_string = "<div class='carousel-inner-image item'><div class='carousel-inner-image-inner space-detail-no-image' style='background-size: 500px'>&nbsp;</div></div>";
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
    };

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

Handlebars.registerHelper('addition', function(lvalue, rvalue) {

    if (arguments.length < 2)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    return new Handlebars.SafeString(Number(lvalue) + Number(rvalue));

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

Handlebars.registerHelper('alphaOptGroupsHTML', function(list) {
    list.sort();
    firstletter = null;
    out = new Array;
    for (var i=0; i < list.length; i++) {
        if (list[i][0] == firstletter) {
            out.push('<option value="'+list[i]+'">'+list[i]+'</option>');
        } else {
            // select multiple with optgroups will crash mobile Safari
            if (firstletter != null || !isMobile) {
                out.push('</optgroup>');
            }
            firstletter = list[i][0];
            if (!isMobile) {
                out.push('<optgroup label="'+firstletter+'">');
            }
            out.push('<option value="'+list[i]+'">'+list[i]+'</option>');
        }
    }
    if (!isMobile) {
        out.push('</optgroup>');
    }
    return new Handlebars.SafeString(out.join(''));
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
                    if((days2[j]-days2[i])== 1 && new_hour[0]=="Midnight") {
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
                    if((days2[j]-days2[i])==-6 && new_hour[0]=="Midnight") {
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
                    data[i] += "PM";
                }else {
                    data[i] = time.join(":");
                }
            }
            if (data[i] == "12AM") {
                data[i] = "Midnight";
            }
        }
        if(data[0]=="Midnight" & data[1]=="Midnight") {
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
        $("#ampm-until").val("PM");
    }else {
        $("#ampm-from").val("AM");
        $("#ampm-until").val("AM");
    }
    if (hour > 12) {
        hour = hour-12;
    }
    hour = ""+hour+":"+min;
    $("#day-from").val(weekday_from_day(date.getDay()));
    $("#hour-from").val(hour);


    $("#day-until").val(weekday_from_day(date.getDay()));
    $("#hour-until").val(hour);
}

function weekday_from_day(day) {
    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (day >=0 && day <= 6) ? weekdays[day] : '';
}

function monthname_from_month(month) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (month >=0 && month < 12) ? months[month] : '';
}

function format_location_filter(data) {
    var source = $('#building_list').html();
    var template = Handlebars.compile(source);
    var node;

    if (source != null) {
        $('#building_list_container').html(template({data: data}));
    }

    //the building multi-select plugin "Chosen" is called here. But it's disabled on mobile
    if ($.cookie('spacescout_search_opts')) {
        var form_opts = JSON.parse($.cookie('spacescout_search_opts'));
        if (form_opts["building_name"]) {
            $('#e9 option').each(function() {
                if ( jQuery.inArray( $(this).val(), form_opts["building_name"]) != -1 ) {
                    $(this).attr("selected", "selected");
                }
            });
        }
    }

    node = $(".chzn-select");
    if (node.length > 0 && node.chosen) {
        node.chosen({width: "98%"});
    }

    $('#e9.building-location').trigger("liszt:updated");
}

function get_location_buildings() {
    // populate the location filter list
    url = '/buildings';
    if (window.default_location !== null) {
        url = url + '?campus=' + window.default_location;
    }
    $.ajax({
        url: url,
        success: format_location_filter
    });

}

// Found at http://stackoverflow.com/questions/476679/preloading-images-with-jquery
function preload(arrayOfImages) {
    for (var i = 0; i < arrayOfImages.length; i++) {
        $('<img/>')[0].src = arrayOfImages[i];
        // Alternatively you could use:
        // (new Image()).src = this;
    }
}


function reset_location_filter() {
    $('#entire_campus').prop('checked', true);
    $('#entire_campus').parent().removeClass("selected");
    $('#building_list_container').hide();
    $('#building_list_input').parent().removeClass("selected");
    $('#building_list_container').children().children().children(".select2-search-choice").remove();
    $('#building_list_container').children().children().children().children().val('Select building(s)');
    $('#building_list_container').children().children().children().children().attr('style', "");
    for (var i = 0; i < $('#e9.building-location').children().children().length; i++) {
        $('#e9.building-location').children().children()[i].selected = false;
    }
    $('#e9.building-location').trigger("liszt:updated")
    run_custom_search();
}

(function(g){

	$(document).ready(function() {
        if ($.cookie('default_location')) {
            $('#location_select').val($.cookie('default_location'));
        }

        // handle changing of the location select
        $('#location_select').change(function() {
            window.default_latitude = $(this).val().split(',')[0];
            window.default_longitude = $(this).val().split(',')[1];
            window.default_location = $(this).val().split(',')[2];
            window.default_zoom = $(this).val().split(',')[3];

            // in case a new location gets selected before the map loads
            if (window.spacescout_map !== null) {
                window.spacescout_map.setCenter(new google.maps.LatLng(window.default_latitude, window.default_longitude));
                window.spacescout_map.setZoom(parseInt(window.default_zoom));
            }
            
            // reset filters for campus change            
            resetFilters();

            run_custom_search();

            window.update_count = true;

            $.cookie('default_location', $(this).val(), { path: '/' });
            reset_location_filter();
            window.spacescout_url.push();
        });

        // handle checkbox and radio button clicks
        $('.checkbox input:checkbox').click(function() {
            if(this.checked) {
                $(this).parent().addClass("selected");
            }   
            else {
                $(this).parent().removeClass("selected");
            }   
        }); 

        $('#filter_hours input:radio').change(function() {
            $(this).parent().addClass("selected");
            $(this).parent().siblings().removeClass("selected");

            if ($('#hours_list_input').is(':checked')) {
                $('#hours_list_container').show();
            }   
            else {
                $('#hours_list_container').hide();
            }   
        }); 

        $('#filter_location input:radio').change(function() {
            $(this).parent().addClass("selected");
            $(this).parent().siblings().removeClass("selected");

            if ($('#building_list_input').is(':checked')) {
                $('#building_list_container').show();
            }   
            else {
                $('#building_list_container').hide();
            }   

        }); 
 
           

        var escape_key_code = 27;

        $(document).keyup(function(e) {
            if (e.keyCode == escape_key_code) {
                if ($('#filter_block').is(':visible')) {

                    $('#filter_block').slideUp(400, function() {
                        var icon = $('.fa-angle-double-up');
                        if (icon.length) {
                            icon.switchClass('fa-angle-double-up', 'fa-angle-double-down', 0);
                        }

                        //mobile style stuff
                        if ($('#container').attr("style")) {
                            $('#container').height('auto');
                            $('#container').css('overflow','visible');
                        }   
                    });
//                    $('#filter_button').show();
//                    $('#space_count_container').show();
//                    $('#view_results_button').hide();
//                    $('#cancel_results_button').hide();
                    $('#filter_button').focus();
                }
                if ($('.space-detail').is(':visible')) {
                    closeSpaceDetails();
                } 
            }
        });

        // handle clicking on the "done" button for filters
        $("#view_results_button").click(function() {

//            $('.count').hide();
//            $('.spaces').hide();
            run_custom_search();
            $.cookie('initial_load', false, { expires: 1 });
            window.spacescout_url.push();
            $('#filter_button').focus();
            
            
        });

        default_open_at_filter();

	});

})(this);

function initializeCarousel() {

    // initialize the carousel
    $('.carousel').each( function() {

        $(this).carousel({
            interval: false
        }); 

        // add carousel pagination
        var html = '<div class="carousel-nav" data-target="' + $(this).attr('id') + '"><ul>';

        for(var i = 0; i < $(this).find('.item').size(); i ++) {
            html += '<li><a';
            if(i == 0) {
                html += ' class="active"';
            }   

            html += ' href="#">•</a></li>';
        }   

        html += '</ul></li>';
        $(this).before(html);

        //set the first item as active
        $(this).find(".item:first-child").addClass("active");

        // hide the controls and pagination if only 1 picture exists
        if ($(this).find('.item').length == 1) {
            $(this).find('.carousel-control').hide();
            $(this).prev().hide(); // hide carousel pagination container for single image carousels
        }   

    }).bind('slid', function(e) {
        var nav = $('.carousel-nav[data-target="' + $(this).attr('id') + '"] ul');
        var index = $(this).find('.item.active').index();
        var item = nav.find('li').get(index);

        nav.find('li a.active').removeClass('active');
        $(item).find('a').addClass('active');
    }); 

    $('.carousel-nav a').bind('click', function(e) {
        var index = $(this).parent().index();
        var carousel = $('#' + $(this).closest('.carousel-nav').attr('data-target'));

        carousel.carousel(index);
        e.preventDefault();
    }); 

    resizeCarouselMapContainer();
}

function initMapCarouselButtons() {
    $('.space-image-map-buttons button').on('click', function(e){
        var target = $(this),
            active = target.hasClass('active'),
            container = target.closest('.space-detail'),
            coords;

        if (!active) {
            if (target.attr('id') == 'carouselControl') {
                $('#spaceCarouselContainer', container).show();
                $('#spaceMap', container).hide();
                $('#carouselControl.btn', container).attr("tabindex", -1).attr("aria-selected", true);
                $('#mapControl.btn', container).attr("tabindex", 0).attr("aria-selected", false);
            }
            else if (target.attr('id') == 'mapControl') {
                $('#spaceCarouselContainer', container).hide();
                $('#spaceMap', container).show();
                $('#carouselControl.btn', container).attr("tabindex", 0).attr("aria-selected", false);
                $('#mapControl.btn', container).attr("tabindex", -1).attr("aria-selected", true);
                coords = JSON.parse(target.attr('data-location'));
                getSpaceMap(container, coords[0], coords[1]);
            }
        }
    });
}

function resizeCarouselMapContainer() {
    // get the width
    if ($('.image-container').width() > $('.map-container').width()) {
        var containerW = $('.image-container').width();
    } else if ($('.map-container').width() > $('.image-container').width()) {
        var containerW = $('.map-container').width();
    }

    // calcuate height based on 3:2 aspect ratio
    var containerH = containerW / 1.5;

    $('.carousel').height(containerH);
    $('.carousel-inner-image').height(containerH);
    $('.carousel-inner-image-inner').height(containerH);
    $('.map-container').height(containerH);
}   

function resetFilters() {
    // reset checkboxes
    $('input[type=checkbox]').each(function() {
        if ($(this).attr('checked')) {
            $(this).attr('checked', false);
            $(this).parent().removeClass("selected");
        }   
    }); 

    // reset capacity
    $('#capacity').val('1');

    // reset hours
    $('#open_now').prop('checked', true);
    $('#open_now').parent().removeClass("selected");
    $('#hours_list_container').hide();
    $('#hours_list_input').parent().removeClass("selected");
    default_open_at_filter();
    $("#day-until").val("No pref");
    $("#hour-until").val("No pref");
    $("#ampm-until").val("AM");

    //reset location
    reset_location_filter();
}

function getSpaceMap(container, lat, lon) {

  if (window.space_latitude) {
    lat = window.space_latitude;
  }

  if (window.space_longitude) {
    lon = window.space_longitude;
  }

  var mapOptions = {
    zoom: 17,
    center: new google.maps.LatLng(lat , lon),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false
  };

  var map = new google.maps.Map($('#spaceMap', container).get(0), mapOptions);

  var image = static_url('img/pins/pin00.png');

  var spaceLatLng = new google.maps.LatLng(lat , lon);
  var spaceMarker = new google.maps.Marker({
      position: spaceLatLng,
      map: map,
      icon: image
  });

}

function replaceReservationNotesUrls(){
    // Replace urls in reservation notes with actual links.
    $(".ei_reservation_notes").each(function() {
        var text = $(this).html(),
            patt = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim,
            url = patt.exec(text);

        if (url !== null) {
            text = text.replace(url, "<a href='" + url + "' target='_blank'>" + url + "</a>");
            $(this).html(text);
        }
    });

}

function closeSpaceDetails() {
    var the_spot_id = $('.space-detail-inner').attr("id");
    the_spot_id = "#" + the_spot_id.replace(/[^0-9]/g, '');
    $('.space-detail').hide("slide", { direction: "right" }, 400, function() {
        $('.space-detail-container').remove();
    });

        // deselect selected space in list
    $('#info_items li').removeClass('selected');
    $(the_spot_id).focus();
}

function static_url(base) {
    return window.spacescout_static_url+base;
}

