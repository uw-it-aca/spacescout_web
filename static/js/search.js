var spot_seeker_map, spot_seeker_infowindow, spot_seeker_marker_ids = {}, spot_seeker_markers = [], speed = 800, mc = null, youarehere = null;

function openInfoWindow(marker, info) {
    var source = $('#spot_info').html();
    var template = Handlebars.compile(source);
    $("#info_items").html(template(info));
    /*
    window.spot_seeker_infowindow = $("#info_items");

    window.spot_seeker_infowindow.html(["<h1>", info.name, "</h1><div>This is the content window about the space.  Here's some info: <ul><li>Hours available: ", info.display_hours_available, "</li><li>Capacity: ", info.capacity, "</li></ul></div><div><a href='/spot/"+info.id+"'>View more</a></div>"].join(""));

    */
    $('.loading').slideUp('fast');
}

function addMarkerListener(marker, data) {
    google.maps.event.addListener(marker, 'click', function() {
        openInfoWindow(marker, data);
    });

}

function openClusterInfoWindow(cluster) {
    var source = $('#cluster_list').html();
    var template = Handlebars.compile(source);
    $('#info_items').html(template({data: cluster.getMarkers()}));
    $('.loading').slideUp('fast');
}

function addClusterListener(markerCluster) {
    google.maps.event.addListener(markerCluster, 'click', function(c) {
        openClusterInfoWindow(c);
    });

}

function openAllMarkerInfoWindow(data) {
    var source = $('#all_markers').html();
    var template = Handlebars.compile(source);
    $('#info_items').html(template({data: data}));
    $('.loading').slideUp('fast');
}

function run_custom_search() {
    // Clear the map
    for (var i = 0; i < window.spot_seeker_markers.length; i++) {
        window.spot_seeker_markers[i].setMap(null);
    }
    window.spot_seeker_markers = [];
    window.spot_seeker_marker_ids = {};

    // Set the search values, so they'll stick through zooms and pans
    window.spot_seeker_search_options = {};

    // type

    // reservable
    if ( $("#reservable").is(":checked") ) {
        window.spot_seeker_search_options["extended_info:reservable"] = "true";
    }

    // Run the search
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

    window.spot_seeker_search_options = {};

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
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    window.spot_seeker_map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    google.maps.event.addListener(window.spot_seeker_map, 'idle', reload_on_idle);


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
    mc = new MarkerClusterer(spot_seeker_map, [], mcOpts);
    for (i = 0; i < data.length; i++) {
        if (!window.spot_seeker_marker_ids[data[i].id]) {
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(data[i].location.latitude, data[i].location.longitude),
                title: data[i].name,
                icon: '/static/img/pins/pin01.png'
            });

            //marker.setMap(window.spot_seeker_map);
            mc.addMarker(marker);
            addMarkerListener(marker, data[i]);

            window.spot_seeker_marker_ids[data[i].id] = true;
            window.spot_seeker_markers.push(marker);
        }
    }
    addClusterListener(mc);
    openAllMarkerInfoWindow(data);

    // you are here marker
    if (navigator.geolocation) {
        my_marker = new google.maps.Marker({
            position: new google.maps.LatLng(youarehere.latitude, youarehere.longitude),
            title: "You are here",
            map: spot_seeker_map,
            icon: '/static/img/pins/blue-dot.png'
        });
        //window.spot_seeker_markers.push(my_marker);
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
    var args = window.spot_seeker_search_options;
    if (!args) {
        args = {};
    }

    var display_bounds = window.spot_seeker_map.getBounds();
    var ne = display_bounds.getNorthEast();
    var sw = display_bounds.getSouthWest();
    var distance = distance_between_points(ne.lat(), ne.lng(), sw.lat(), sw.lng());
    // Calculated in KM
    distance = distance * 1000;

    var center = window.spot_seeker_map.getCenter();
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


