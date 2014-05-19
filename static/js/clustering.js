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




var visible_markers = [];
var active_marker;
var spherical = google.maps.geometry.spherical;

function updatePins(spots) {     //this could be a listener on the map/done button.  investigating how it's done now
    if (window.update_count) {
        var source = $('#space_count').html();
        var template = Handlebars.compile(source);
        $('#space_count_container').html(template({count: spots.length}));
        window.update_count = false;
    }
    clearActiveMarker();
    openAllMarkerInfoWindow(spots);
    var zoom = window.spacescout_map.getZoom();
    var pins;
    update_spacescout_markers(spots);
    ss_markers = window.spacescout_markers;
    if ($.inArray(zoom, window.by_building_zooms) != -1){
        pins = groupByBuilding(ss_markers);
    }
    else{
        pins = groupByDistance(ss_markers);
    }
    showMarkers(pins);
}

//maybe refine this to only add new spots to the list?
function update_spacescout_markers(spots) {
    window.spacescout_markers = [];
    var holderspot;
    for (var i = 0; i < spots.length; i++) {
        holderspot = new google.maps.Marker({
            position: new google.maps.LatLng(spots[i].location.latitude, spots[i].location.longitude),
            data: spots[i]
        });
        window.spacescout_markers.push(holderspot);
    }
    $("#info_list").scrollTop(0);
}


function groupByDistance(markers) {
    var bounds = window.spacescout_map.getBounds();
    var ne_corner = bounds.getNorthEast();
    var sw_corner = bounds.getSouthWest();
    var diag = spherical.computeDistanceBetween(ne_corner, new google.maps.LatLng(ne_corner.lat(), sw_corner.lng()));
    var grouped_spots = [], group, grouped, group_center, distance_ratio, position_holder;
    for (var count = markers.length-1; count >= 0; count--) {
        grouped = false;
        group_center = [];
        position_holder = markers[count].getPosition();
        for (var j = 0; j < grouped_spots.length; j++) { //should only check existing groups
            group_center = grouped_spots[j][0].getPosition();
            distance_ratio = spherical.computeDistanceBetween(position_holder, group_center) / diag;
            if (distance_ratio < window.by_distance_ratio) {
                grouped_spots[j].push(markers[count]);
                markers.splice(count, 1);
                grouped = true;
                break;
            }
        }
        if (!grouped) {
            group = [markers[count]];
            grouped_spots.push(group);
            markers.splice(count, 1);

        }
    }
    return grouped_spots;
}


function groupByBuilding(markers) {
    var building_spots = [];
    var group = [];
    var grouped;
    for (var count = markers.length - 1; count >= 0; count--) {
        grouped = false;
        for (var buildingcount = 0; buildingcount < building_spots.length; buildingcount++) {
            if (markers[count].data.location.building_name === building_spots[buildingcount][0].data.location.building_name) {
                grouped = true;
                building_spots[buildingcount].push(markers[count]);
                break;
            }
        }
        if (!grouped){
            group = [markers[count]];
            building_spots.push(group);
        }
    }
    return building_spots;
}

function showMarkers(marker_groups){
    var group_center, spots;
    clear_map();
    for(var counter = 0; counter < marker_groups.length; counter++) {
        group_center = getGroupCenter(marker_groups[counter]);
        spots = getSpotList(marker_groups[counter]);
        createMarker(spots, group_center);
    }
}

function getSpotList(group){
    var the_list = [];
    for (var i = 0; i < group.length; i++) {
        the_list.push(group[i].data);
    }
    return the_list;
}

function createMarker(spots, group_center) {
    var num_spots = spots.length;
    var main_icon = new google.maps.MarkerImage(static_url('img/pins/pin00@2x.png'), null, null, null, new google.maps.Size(40,40));
    var alt_icon = new google.maps.MarkerImage(static_url('img/pins/pin00-alt@2x.png'), null, null, null, new google.maps.Size(40,40));;

    var marker= new MarkerWithLabel({
        position: group_center,
        icon: main_icon,
        main_icon: main_icon,
        alt_icon: alt_icon,
        map: window.spacescout_map,
        spots: spots,
        labelText: num_spots, // # of spots to display on label in text
    	labelClass: "map-label", // the CSS class for the label
    	labelStyle: {top: "-34px", left: "-15px"} // position label over main_icon (position assumes 40x40 marker)
    });
    
    google.maps.event.addListener(marker, 'click', function() {
        loadMarkerSpots(marker, marker.spots); 
    });
    //next three lines by samolds
    google.maps.event.addListener(marker, 'mousedown', function(c) {
        window.spacescout_map.setOptions({draggable: false});
    });

    visible_markers.push(marker);
}

//group is a list of unshown markers representing individual spots
function getGroupCenter(group){
    if (group.length > 1) {
        var lat = 0, lon = 0;
        for (var i = 0; i < group.length; i++){
            lat += group[i].getPosition().lat();
            lon += group[i].getPosition().lng();
        }
        lat = lat / i;
        lon = lon / i;
        return new google.maps.LatLng(lat, lon);
    }
    return group[0].getPosition();
}

//is this ever called?
function clearActiveMarker() {
    for (var i = 0; i < visible_markers.length; i++) {
        visible_markers[i].setIcon(visible_markers[i].main_icon);
    }
    if(active_marker){
        active_marker.setZIndex();
    }
    active_marker = null;
}

function updateActiveMarker(marker) {
    active_marker.setIcon(active_marker.alt_icon);
    active_marker.setZIndex();
    marker.setIcon(marker.main_icon);
    marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
    active_marker = marker;
}

function setActiveMarker(marker) {
    active_marker = marker;
    marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
    for (var i = 0; i < visible_markers.length; i++) {
        if (visible_markers[i] != marker) {
            visible_markers[i].setIcon(visible_markers[i].alt_icon);
        }
    }
}

function loadMarkerSpots(marker, data) {
    // reset scroll position
    $("#info_list").scrollTop(0);

    if (active_marker != null) {
        updateActiveMarker(marker);
    }
    else {
        setActiveMarker(marker);
    }

    var source = $('#cluster_list').html();
    var template = Handlebars.compile(source);
    data = buildingNameHeaders(data);
    $('#info_items').html(template({data: data}));

    // LazyLoading the spot images
    if(isMobile){
            var lazyload_target = window;
        }else{
            var lazyload_target = '#info_list';
        }
    $(lazyload_target).lazyScrollLoading({
        lazyItemSelector : ".lazyloader",
        onLazyItemFirstVisible : function(e, $lazyItems, $firstVisibleLazyItems) {
            $firstVisibleLazyItems.each(function() {
                var $img = $(this);
                var src = $img.attr('data-src');
                $img.css('background', 'transparent url("'+src+'") no-repeat 50% 50%');
            });
        }
    });

    scrollToTop('info_list');
    $('.loading').slideUp('fast');
    data_loaded(visible_markers.length);
}

function clear_map() {
    for (var i = 0; i < visible_markers.length; i++) {
        visible_markers[i].setMap(null);
    }
    visible_markers = [];
}
