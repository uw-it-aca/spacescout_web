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

    Changes
    =================================================================

    sbutler1@illinois.edu: fix obvious JSHint bugs.
    sbutler1@illinois.edu: clean up indenting and hide non-global vars/functions
*/


// H = Handlebars, $ = jQuery, GM = google.maps
(function (H, $, GM) {
    var visible_markers = [];
    var active_marker;
    var spherical = GM.geometry.spherical;

    function updatePins(spots) {    //this could be a listener on the map/done button.  investigating how it's done now
        if (window.update_count) {
            var source = $('#space_count').html();
            var template = H.compile(source);
            $('#space_count_container').html(template({count: spots.length}));
            window.update_count = false;
        }

        _clearActiveMarker();
        openAllMarkerInfoWindow(spots);
        _updateMarkers(spots);

        var zoom = window.spacescout_map.getZoom();
        var pins;
        var ss_markers = window.spacescout_markers;
        if ($.inArray(zoom, window.by_building_zooms) != -1) {
            pins = _groupByBuilding(ss_markers);
        } else {
            pins = _groupByDistance(ss_markers);
        }
        _showMarkers(pins);
    }
    window.updatePins = updatePins;

    //maybe refine this to only add new spots to the list?
    function _updateMarkers(spots) {
        window.spacescout_markers = [];
        for (var i = 0; i < spots.length; i++) {
            var holderspot = new GM.Marker({
                position: new GM.LatLng(spots[i].location.latitude, spots[i].location.longitude),
                data: spots[i]
            });
            window.spacescout_markers.push(holderspot);
        }
        $("#info_list").scrollTop(0);
    }


    function _groupByDistance(markers) {
        var bounds = window.spacescout_map.getBounds();
        var ne_corner = bounds.getNorthEast();
        var sw_corner = bounds.getSouthWest();
        var diag = spherical.computeDistanceBetween(ne_corner, new GM.LatLng(ne_corner.lat(), sw_corner.lng()));
        var grouped_spots = [];

        for (var count = markers.length-1; count >= 0; count--) {
            var grouped = false;
            var position_holder = markers[count].getPosition();
            for (var j = 0; j < grouped_spots.length; j++) { //should only check existing groups
                var group_center = grouped_spots[j][0].getPosition();
                var distance_ratio = spherical.computeDistanceBetween(position_holder, group_center) / diag;
                if (distance_ratio < window.by_distance_ratio) {
                    grouped_spots[j].push(markers[count]);
                    markers.splice(count, 1);
                    grouped = true;
                    break;
                }
            }
            if (!grouped) {
                var group = [markers[count]];
                grouped_spots.push(group);
                markers.splice(count, 1);

            }
        }
        return grouped_spots;
    }


    function _groupByBuilding(markers) {
        var building_spots = [];
        for (var count = markers.length - 1; count >= 0; count--) {
            var grouped = false;
            for (var buildingcount = 0; buildingcount < building_spots.length; buildingcount++) {
                if (markers[count].data.location.building_name === building_spots[buildingcount][0].data.location.building_name) {
                    grouped = true;
                    building_spots[buildingcount].push(markers[count]);
                    break;
                }
            }
            if (!grouped){
                var group = [markers[count]];
                building_spots.push(group);
            }
        }
        return building_spots;
    }

    function _showMarkers(marker_groups) {
        _clearMap();
        for (var counter = 0; counter < marker_groups.length; counter++) {
            var group_center = _getGroupCenter(marker_groups[counter]);
            var spots = _getSpotList(marker_groups[counter]);
            _createMarker(spots, group_center);
        }
    }

    function _getSpotList(group) {
        var the_list = [];
        for (var i = 0; i < group.length; i++) {
            the_list.push(group[i].data);
        }
        return the_list;
    }

    function _createMarker(spots, group_center) {
        var num_spots = spots.length;
        var main_icon = {
            url: 'static/img/pins/pin00@2x.png',
            scaledSize: new GM.Size(40,40)
        };
        var alt_icon = {
            url: 'static/img/pins/pin00-alt@2x.png',
            scaledSize: new GM.Size(40,40)
        };

        var marker = new MarkerWithLabel({
            position: group_center,
            icon: main_icon,
            main_icon: main_icon,
            alt_icon: alt_icon,
            map: window.spacescout_map,
            spots: spots,
            labelContent: num_spots, // # of spots to display on label in text
            labelClass: "map-label", // the CSS class for the label
            labelAnchor: new GM.Point(15, 34) // position label over main_icon (position assumes 40x40 marker)
        });
        
        GM.event.addListener(marker, 'click', function() {
            _loadMarkerSpots(marker, marker.spots); 
        });
        //next three lines by samolds
        GM.event.addListener(marker, 'mousedown', function(c) {
            window.spacescout_map.setOptions({draggable: false});
        });

        visible_markers.push(marker);
    }

    //group is a list of unshown markers representing individual spots
    function _getGroupCenter(group) {
        if (group.length > 1) {
            var lat = 0, lon = 0;
            for (var i = 0; i < group.length; i++) {
                lat += group[i].getPosition().lat();
                lon += group[i].getPosition().lng();
            }
            lat = lat / i;
            lon = lon / i;
            return new GM.LatLng(lat, lon);
        }
        return group[0].getPosition();
    }

    function _clearActiveMarker() {
        for (var i = 0; i < visible_markers.length; i++) {
            visible_markers[i].setIcon(visible_markers[i].main_icon);
        }
        if (active_marker) {
            active_marker.setZIndex();
        }
        active_marker = null;
    }

    function _updateActiveMarker(marker) {
        active_marker.setIcon(active_marker.alt_icon);
        active_marker.setZIndex();
        marker.setIcon(marker.main_icon);
        marker.setZIndex(GM.Marker.MAX_ZINDEX + 1);
        active_marker = marker;
    }

    function _setActiveMarker(marker) {
        active_marker = marker;
        marker.setZIndex(GM.Marker.MAX_ZINDEX + 1);
        for (var i = 0; i < visible_markers.length; i++) {
            if (visible_markers[i] != marker) {
                visible_markers[i].setIcon(visible_markers[i].alt_icon);
            }
        }
    }

    function _loadMarkerSpots(marker, data) {
        // reset scroll position
        $("#info_list").scrollTop(0);

        if (active_marker) {
            _updateActiveMarker(marker);
        } else {
            _setActiveMarker(marker);
        }

        var source = $('#cluster_list').html();
        var template = H.compile(source);
        data = buildingNameHeaders(data);
        $('#info_items').html(template({data: data}));

        // LazyLoading the spot images
        var lazyload_target = isMobile ? window : '#info_list';
        $(lazyload_target).lazyScrollLoading({
            lazyItemSelector : ".lazyloader",
            onLazyItemFirstVisible : function(e, $lazyItems, $firstVisibleLazyItems) {
                $firstVisibleLazyItems.each(function() {
                    var $img = $(this);
                    var src = $img.data('src');
                    $img.css('background', 'transparent url("'+src+'") no-repeat 50% 50%');
                });
            }
        });

        scrollToTop('info_list');
        $('.loading').slideUp('fast');
    }

    function _clearMap() {
        for (var i = 0; i < visible_markers.length; i++) {
            visible_markers[i].setMap(null);
        }
        visible_markers = [];
    }
})(Handlebars, jQuery, google.maps);

