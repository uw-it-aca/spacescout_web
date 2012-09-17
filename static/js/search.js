var spot_seeker_map, spot_seeker_infowindow, spot_seeker_marker_ids = {}, spot_seeker_markers = [];
var mc = null;

function openInfoWindow(marker, info) {
    window.spot_seeker_infowindow = $("#info_items");

    window.spot_seeker_infowindow.html(["<h1>", info.name, "</h1><div>This is the content window about the space.  Here's some info: <ul><li>Hours available: ", info.display_hours_available, "</li><li>Capacity: ", info.capacity, "</li></ul></div><div><a href='/spot/"+info.id+"'>View more</a></div>"].join(""));
    $('.loading').slideUp('fast');
}

function addMarkerListener(marker, data) {
    google.maps.event.addListener(marker, 'click', function() {
        openInfoWindow(marker, data);
    });

}

function openClusterInfoWindow(cluster) {

    window.spot_seeker_infowindow = $("#info_items");
    infohtml = "<ul>";
    for (i = 0; i < cluster.getMarkers().length; i++) {
        mark = cluster.getMarkers()[i];
        infohtml += "<li>" + mark.title + "</li>";
    }
    infohtml += "</ul>";

    window.spot_seeker_infowindow.html(infohtml);

    $('.loading').slideUp('fast');
}

function addClusterListener(markerCluster) {
    google.maps.event.addListener(markerCluster, 'click', function(c) {
        openClusterInfoWindow(c);
    });

}

function openAllMarkerInfoWindow(data) {

    window.spot_seeker_infowindow = $("#info_items");
    infohtml = "<ul>";
    for (i = 0; i < data.length; i++) {
        mark = data[i];
        infohtml += "<li><img src='http://placehold.it/75x75' class='img-rounded'>" + mark.name + "</li>";
    }
    infohtml += "</ul>";

    window.spot_seeker_infowindow.html(infohtml);

    $('.loading').slideUp('fast');
}

/* function run_custom_search() {
    // Clear the map
    for (var i = 0; i < window.spot_seeker_markers.length; i++) {
        window.spot_seeker_markers[i].setMap(null);
    }
    window.spot_seeker_markers = [];
    window.spot_seeker_marker_ids = {};

    // Set the search values, so they'll stick through zooms and pans
    window.spot_seeker_search_options = {};
    window.spot_seeker_search_options["name"] = $("#spot_name").val();

    // Run the search
    fetch_data();
    $("#dialog-modal").dialog("close");
} */

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

    $("#run_custom_search").click(run_custom_search);*/

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


