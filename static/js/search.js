var spacescout_map = null, spacescout_infowindow, spacescout_marker_ids = {}, spacescout_markers = [], speed = 800, mc = null, youarehere = null;

function openInfoWindow(marker, info) {
    
    // reset scroll position
    $("#info_list").scrollTop(0);
    
    // show the loading spinner for a few seconds
    $('.loading').show().delay(3000);

    var source = $('#spot_info').html();
    var template = Handlebars.compile(source);
    $("#info_items").html(template(info));

    scrollToTop('info_list');
    $('.loading').slideUp('fast');
    
    lazyLoadSpaceImages();

}

function addMarkerListener(marker, data) {
    google.maps.event.addListener(marker, 'click', function(m) {
        openInfoWindow(m, data);
    });
}

function openClusterInfoWindow(cluster, data) {
    
    // reset scroll position
    $("#info_list").scrollTop(0);
        
    // show the loading spinner for a few seconds
    $('.loading').show().delay(3000).focus();

    // I'm sure there's a better way of filtering this down to spaces...
    var spaces = new Array();
    for (i=0; i < cluster.getMarkers().length; i++) {
        for (j=0; j < data.length; j++) {
            if (data[j].name == cluster.getMarkers()[i].title) {
                spaces.push(data[j]);
            }
        }
    }
    var source = $('#cluster_list').html();
    var template = Handlebars.compile(source);
    $('#info_items').html(template({data: spaces}));

    scrollToTop('info_list');
    $('.loading').slideUp('fast');
    
    lazyLoadSpaceImages();

}

function addClusterListener(markerCluster, data) {
    google.maps.event.addListener(markerCluster, 'click', function(c) {
        openClusterInfoWindow(c, data);
    });

}

function openAllMarkerInfoWindow(data) {
    var source = $('#all_markers').html();
    var template = Handlebars.compile(source);
    $('#info_items').html(template({data: data}));
    $('.loading').slideUp('fast');
        
    lazyLoadSpaceImages();

}

// jquery function to check if scrollable
(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

function lazyLoadSpaceImages() {
    // container lazy loading for desktop ui
    if ($('#info_list').hasScrollBar()) { 
        $("img.lazy").lazyload({         
             container: $("#info_list")
         });
        console.log("this div has scroll");
    }
    else { //mobile ui
        $("img.lazy").lazyload();
        console.log("this div has no scroll");
    }
}
    
function run_custom_search() {
    // Clear the map
    for (var i = 0; i < window.spacescout_markers.length; i++) {
        window.spacescout_markers[i].setMap(null);
    }
    window.spacescout_markers = [];
    window.spacescout_marker_ids = {};
    mc.clearMarkers();

    // Set the search values, so they'll stick through zooms and pans
    window.spacescout_search_options = {};

    // type
    var checked = new Array();
    $.each($("input[name='type']:checked"), function() {
        checked.push($(this).val());
    });
    window.spacescout_search_options["type"] = checked;

    // reservable
    if ( $("#reservable").is(":checked") ) {
        window.spacescout_search_options["extended_info:reservable"] = "true";
    }

    // capacity
    window.spacescout_search_options["capacity"] = $("#capacity option:selected").val();

    // hours

    // location
    if ($('select#e9').val()) {
        window.spacescout_search_options["building_name"] = $('select#e9').val();
    }

    // equipment
    checked = [];
    $.each($("input[name='equipment']:checked"), function() {
        checked.push($(this).val());
    });
    for (i=0; i < checked.length; i++) {
        window.spacescout_search_options["extended_info:" + checked[i]] = true;
    }

    // noise
    checked = [];
    $.each($("input[name='noise_level']:checked"), function() {
        checked.push($(this).val());
    });
    window.spacescout_search_options["extended_info:noise_level"] = checked;

    // lighting
    if ( $("#lighting").is(":checked") ) {
        window.spacescout_search_options["extended_info:has_natural_light"] = "true";
    }

    // food/coffee
    checked = [];
    $.each($("input[name='food_nearby']:checked"), function() {
        checked.push($(this).val());
    });
    window.spacescout_search_options["extended_info:food_nearby"] = checked;

    // Run the search
    //console.log(window.spacescout_search_options);
    fetch_data();
    $("#filter_block").slideUp(speed);
}

function initialize() {
    var i;

    /*$("#cancel_custom_search").click(function() {
        $( "#dialog-modal" ).dialog("close");
    });

    $("#custom_search").click(function() {
        $( "#dialog-modal" ).dialog({
            height: 340,
            width: 500,
            modal: true
        });
    });
    */
    $("#view_results_button").click(run_custom_search);

    window.spacescout_search_options = {};

    if (navigator.geolocation) {
        // Doing a timeout here, to make sure we load something...
        window.position_timeout = window.setTimeout(function() {
            load_map(window.default_latitude, window.default_longitude, window.default_zoom);
        }, 5000);

        navigator.geolocation.getCurrentPosition(
            // Success...
            function(position) {
                window.clearTimeout(window.position_timeout);
                youarehere = position.coords;
                load_map(position.coords.latitude, position.coords.longitude, window.default_zoom);
            }
        );
    }
    else {
        load_map(window.default_latitude, window.default_longitude, window.default_zoom);
    }

}

function load_map(latitude, longitude, zoom) {
    $('.loading').show();
    var myOptions = {
        center: new google.maps.LatLng(latitude, longitude),
        zoom: zoom,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    if (window.spacescout_map == null) {
        window.spacescout_map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    } else {
        window.spacescout_map.setCenter(new google.maps.LatLng(latitude, longitude));
    }
    google.maps.event.addListener(window.spacescout_map, 'idle', reload_on_idle);


}

function display_search_results(data) {
    $('.loading').show();

    var mcOpts = {
        averageCenter: true,
        zoomOnClick: false,
        styles: [{
            textColor: 'white',
            textSize: 12,
            fontWeight: 'normal',
            anchor: [5, 0], // These values can only be positive
            height: 40,
            width: 35, // The icon width is actually 40, but the anchorIcon offset doesn't seem to work right, this gets the cluster icon centered on the number
            url: '/static/img/pins/pin00.png',
        }]
    };
    mc = new MarkerClusterer(spacescout_map, [], mcOpts);
    for (i = 0; i < data.length; i++) {
        if (!window.spacescout_marker_ids[data[i].id]) {
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(data[i].location.latitude, data[i].location.longitude),
                title: data[i].name,
                icon: '/static/img/pins/pin01.png'
            });

            //marker.setMap(window.spacescout_map);
            mc.addMarker(marker);
            addMarkerListener(marker, data[i]);

            window.spacescout_marker_ids[data[i].id] = true;
            window.spacescout_markers.push(marker);
        }
    }
    addClusterListener(mc, data);
    openAllMarkerInfoWindow(data);

    // you are here marker
    if (youarehere != null) {
        my_marker = new google.maps.Marker({
            position: new google.maps.LatLng(youarehere.latitude, youarehere.longitude),
            title: "You are here",
            map: spacescout_map,
            icon: '/static/img/pins/blue-dot.png'
        });
        //window.spacescout_markers.push(my_marker);
    }

}

function load_data(data) {
    display_search_results(data);
}

function reload_on_idle() {
    fetch_data();
}

function fetch_data() {
    $('.loading').show();
    var args = window.spacescout_search_options;
    if (!args) {
        args = {};
    }

    var display_bounds = window.spacescout_map.getBounds();
    var ne = display_bounds.getNorthEast();
    var sw = display_bounds.getSouthWest();
    var distance = distance_between_points(ne.lat(), ne.lng(), sw.lat(), sw.lng());
    // Calculated in KM
    distance = distance * 1000;

    var center = window.spacescout_map.getCenter();
    args["center_latitude"] = [center.lat()];
    args["center_longitude"] = center.lng();
    args["open_now"] = 1;
    args["distance"] = distance;
    args["limit"] = 0;

    var url_args = ["/search/?"];
    for (var key in args) {
        if (typeof(args[key]) == "object") {
            for (var i = 0; i < args[key].length; i++) {
                url_args.push(encodeURIComponent(key), "=", encodeURIComponent(args[key][i]), '&');
            }
        }
        else {
            url_args.push(encodeURIComponent(key), "=", encodeURIComponent(args[key]), '&');
        }
    }

    url_args.pop();

    var query = url_args.join("");

    $.ajax({
        url: query,
        success: load_data
    });
}

function distance_between_points(lat1, lon1, lat2, lon2) {
    // from http://www.movable-type.co.uk/scripts/latlong.html
    var R = 6371; // km
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180;
    var lat1 = lat1 * Math.PI / 180;
    var lat2 = lat2 * Math.PI / 180;

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
}

// ScrollTo a spot on the UI
function scrollToTop(id) {
    // Scroll
    $('html,body').animate({ scrollTop: $("#"+id).offset().top},'fast');
}


