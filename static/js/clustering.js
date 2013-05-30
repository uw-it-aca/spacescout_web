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

//start
function MarkerLabel_(marker) {
  var me = this;

  this.marker_ = marker;

  this.labelDiv_ = document.createElement("div");
  // Prevent selection of the text in the label:
  this.labelDiv_.onselectstart = function () {
    return false;
  };

  this.containerDiv_ = document.createElement("div");
  this.containerDiv_.appendChild(this.labelDiv_);
  this.containerDiv_.style.cssText = "position: absolute; display: none;";

  this.setMap(this.marker_.getMap());
  google.maps.event.addListener(this.marker_, "map_changed", function () {
    me.setMap(me.marker_.getMap());
  });
}

// MarkerLabel_ inherits from <code>OverlayView</code>:
MarkerLabel_.prototype = new google.maps.OverlayView();

/**
 * Adds the DIV representing the label to the DOM. It is called
 * automatically when the marker's <code>setMap</code> method is called.
 * @private
 */
MarkerLabel_.prototype.onAdd = function () {
  var me = this;
  var cMouseIsDown = false;
  var cDraggingInProgress = false;
  var cLastPosition;
  var cLatOffset;
  var cLngOffset;
  var cIgnoreClick;

  this.getPanes().overlayImage.appendChild(this.containerDiv_);

  this.listeners_ = [
    google.maps.event.addDomListener(document, "mouseup", function (mEvent) {
      if (cDraggingInProgress) {
        mEvent.latLng = cLastPosition;
        cIgnoreClick = true; // Set flag to ignore the click event reported after a label drag
        google.maps.event.trigger(me.marker_, "dragend", mEvent);
      }
      google.maps.event.trigger(me.marker_, "mouseup", mEvent);
      cMouseIsDown = false;
      cDraggingInProgress = false;
    }),
    google.maps.event.addListener(me.marker_.getMap(), "mousemove", function (mEvent) {
      if (cMouseIsDown && me.marker_.getDraggable()) {
        // Change the reported location from the mouse position to the marker position:
        mEvent.latLng = new google.maps.LatLng(mEvent.latLng.lat() - cLatOffset, mEvent.latLng.lng() - cLngOffset);
        cLastPosition = mEvent.latLng;
        if (cDraggingInProgress) {
          me.marker_.setPosition(mEvent.latLng);
          google.maps.event.trigger(me.marker_, "drag", mEvent);
        } else {
          // Calculate offsets from the click point to the marker position:
          cLatOffset = mEvent.latLng.lat() - me.marker_.getPosition().lat();
          cLngOffset = mEvent.latLng.lng() - me.marker_.getPosition().lng();
          cDraggingInProgress = true;
          google.maps.event.trigger(me.marker_, "dragstart", mEvent);
        }
      }
    }),
    google.maps.event.addDomListener(this.containerDiv_, "mouseover", function (e) {
      me.containerDiv_.style.cursor = "pointer";
      google.maps.event.trigger(me.marker_, "mouseover", e);
    }),
    google.maps.event.addDomListener(this.containerDiv_, "mouseout", function (e) {
      me.containerDiv_.style.cursor = me.marker_.getCursor();
      google.maps.event.trigger(me.marker_, "mouseout", e);
    }),
    google.maps.event.addDomListener(this.containerDiv_, "click", function (e) {
      if (cIgnoreClick) { // Ignore the click reported when a label drag ends
        cIgnoreClick = false;
      } else {
        google.maps.event.trigger(me.marker_, "click", e);
      }
    }),
    google.maps.event.addDomListener(this.containerDiv_, "dblclick", function (e) {
      google.maps.event.trigger(me.marker_, "dblclick", e);
      // Prevent map zoom when double-clicking on a label:
      e.cancelBubble = true;
      if (e.stopPropagation) {
        e.stopPropagation();
      }
    }),
    google.maps.event.addDomListener(this.containerDiv_, "mousedown", function (e) {
      cMouseIsDown = true;
      cDraggingInProgress = false;
      cLatOffset = 0;
      cLngOffset = 0;
      google.maps.event.trigger(me.marker_, "mousedown", e);
      // Prevent map pan when starting a drag on a label:
      e.cancelBubble = true;
      if (e.stopPropagation) {
        e.stopPropagation();
      }
    }),
    google.maps.event.addListener(this.marker_, "labeltext_changed", function () {
      me.labelDiv_.innerHTML = me.marker_.get("labelText");
    }),
    google.maps.event.addListener(this.marker_, "labelclass_changed", function () {
      me.labelDiv_.className = me.marker_.get("labelClass");
    }),
    google.maps.event.addListener(this.marker_, "labelstyle_changed", function () {
      var i, labelStyle;

      // Apply default style values to the label:
      me.labelDiv_.className = me.marker_.get("labelClass");
      // Apply style values defined in the labelStyle parameter:
      labelStyle = me.marker_.get("labelStyle");
      for (i in labelStyle) {
        if (labelStyle.hasOwnProperty(i)) {
          me.labelDiv_.style[i] = labelStyle[i];
        }
      }
      // Make sure the opacity setting causes the desired effect on MSIE:
      if (typeof me.labelDiv_.style.opacity !== "undefined") {
        me.labelDiv_.style.filter = "alpha(opacity=" + (me.labelDiv_.style.opacity * 100) + ")";
      }
      // Apply mandatory style value:
      me.labelDiv_.style.position = "relative";
    }),
    google.maps.event.addListener(this.marker_, "labelzindex_changed", function () {
      me.containerDiv_.style.zIndex = me.marker_.get("labelZIndex");
    }),
    google.maps.event.addListener(this.marker_, "labelvisible_changed", function () {
      if (me.marker_.get("labelVisible")) {
        me.containerDiv_.style.display = me.marker_.getVisible() ? "block" : "none";
      } else {
        me.containerDiv_.style.display = "none";
      }
    }),
    google.maps.event.addListener(this.marker_, "position_changed", function () {
      var position = me.getProjection().fromLatLngToDivPixel(me.marker_.getPosition());
      me.containerDiv_.style.left = position.x + "px";
      me.containerDiv_.style.top = position.y + "px";
    }),
    google.maps.event.addListener(this.marker_, "visible_changed", function () {
      if (me.marker_.get("labelVisible")) {
        me.containerDiv_.style.display = me.marker_.getVisible() ? "block" : "none";
      } else {
        me.containerDiv_.style.display = "none";
      }
    }),
    google.maps.event.addListener(this.marker_, "title_changed", function () {
      me.containerDiv_.title = me.marker_.getTitle();
    })
  ];
};

/**
 * Removes the DIV for the label from the DOM. It also removes all event handlers.
 * This method is called when <code>setMap(null)</code> is called.
 * @private
 */
MarkerLabel_.prototype.onRemove = function () {
  var i;
  this.containerDiv_.parentNode.removeChild(this.containerDiv_);

  // Remove event listeners:
  for (i = 0; i < this.listeners_.length; i++) {
    google.maps.event.removeListener(this.listeners_[i]);
  }
};

/**
 * Draws the label with the specified style and at the specified location.
 * @private
 */
MarkerLabel_.prototype.draw = function () {
  var i, labelStyle;
  
  // Position the container:
  var position = this.getProjection().fromLatLngToDivPixel(this.marker_.getPosition());
  this.containerDiv_.style.left = position.x + "px";
  this.containerDiv_.style.top = position.y + "px";

  this.containerDiv_.style.zIndex = this.marker_.get("labelZIndex");

  if (this.marker_.get("labelVisible")) {
    this.containerDiv_.style.display = this.marker_.getVisible() ? "block" : "none";
  } else {
    this.containerDiv_.style.display = "none";
  }

  this.containerDiv_.title = this.marker_.getTitle() || "";

  // Apply default style values to the label:
  this.labelDiv_.className = this.marker_.get("labelClass");
  // Apply style values defined in the labelStyle parameter:
  labelStyle = this.marker_.get("labelStyle");
  for (i in labelStyle) {
    if (labelStyle.hasOwnProperty(i)) {
      this.labelDiv_.style[i] = labelStyle[i];
    }
  }
  // Make sure the opacity setting causes the desired effect on MSIE:
  if (typeof this.labelDiv_.style.opacity !== "undefined") {
    this.labelDiv_.style.filter = "alpha(opacity=" + (this.labelDiv_.style.opacity * 100) + ")";
  }
  // Apply mandatory style value:
  this.labelDiv_.style.position = "relative";

  this.labelDiv_.innerHTML = this.marker_.get("labelText");
};

/**
 * @name MarkerWithLabelOptions
 * @class This class represents the optional parameter passed into <code>MarkerWithLabel</code>.
 *  The properties available are the same as for <code>google.maps.Marker</code> with the addition
 *  of the properties below. To change any of these new properties after the labeled marker has
 *  been created, call <code>google.maps.Marker.set(propertyName, propertyValue)</code>.
 *  <p>
 *  When any of these properties changes, a property changed event is fired. The names of these
 *  events are derived from the name of the property and are of the form <code>propertyname_changed</code>.
 *  For example, if the text of the label changes, a <code>labeltext_changed</code> event is fired.
 *  <p>
 * @property {string} [labelText] The text of the label. It can include HTML code.
 * @property {string} [labelClass] The name of the CSS class defining the styles for the label.
 * @property {Object} [labelStyle] An object literal whose properties define specific CSS
 *  style values to be applied to the label. Style values defined here override those that may
 *  be defined in the <code>labelClass</code> style sheet.
 * @property {number} [labelZIndex] The zIndex value for the label. Setting this value to be
 *  higher or lower than zIndex for the marker controls whether the label appears on top of
 *  or underneath the marker, respectively.
 * @property {boolean} [labelVisible] A flag indicating whether the label is to be visible.
 *  The default is <code>true</code>. Note that even when <code>labelVisible</code> is
 *  <code>true</code>, the label will <i>not</i> be visible if the marker itself is not visible
 *  (i.e., if the marker's <code>visible</code> property is <code>false</code>).
 */
/**
 * This constructor is used to create a marker with an associated label.
 * @constructor
 * @param {MarkerWithLabelOptions} [opt_options] The optional parameters.
 */
function MarkerWithLabel(opt_options) {
  opt_options.labelText = opt_options.labelText || "";
  opt_options.labelClass = opt_options.labelClass || "markerLabels";
  opt_options.labelStyle = opt_options.labelStyle || {};
  opt_options.labelZIndex = opt_options.labelZIndex || null;
  if (typeof opt_options.labelVisible === "undefined") {
    opt_options.labelVisible = true;
  }

  this.setValues(opt_options);
  this.theLabel_ = new MarkerLabel_(this);
}

// MarkerWithLabel inherits from <code>Marker</code>:
MarkerWithLabel.prototype = new google.maps.Marker();



//end




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
    var main_icon = new google.maps.MarkerImage('static/img/pins/pin00@2x.png', null, null, null, new google.maps.Size(40,40));
    var alt_icon = new google.maps.MarkerImage('static/img/pins/pin00-alt@2x.png', null, null, null, new google.maps.Size(40,40));;
    /*
    if (num_spots >= 30) {
        main_icon = 'static/img/pins/pin30@2x.png';
        alt_icon = 'static/img/pins/pin30-alt.png';
    }
    else if (num_spots < 10) {
        main_icon = new google.maps.MarkerImage('static/img/pins/pin0' + num_spots + '@2x.png', null, null, null, new google.maps.Size(40,40));
        alt_icon = 'static/img/pins/pin0' + num_spots + '-alt.png';
    }
    else {
        main_icon = new google.maps.MarkerImage('static/img/pins/pin' + num_spots + '@2x.png', null, null, null, new google.maps.Size(40,40));
        alt_icon = 'static/img/pins/pin' + num_spots + '-alt.png';
    }*/

    var marker= new MarkerWithLabel({
        position: group_center,
        icon: main_icon,
        main_icon: main_icon,
        alt_icon: alt_icon,
        map: window.spacescout_map,
        spots: spots,
        labelText: num_spots, // # of spots on label in text form
    	labelClass: "map-label", // the CSS class for the label
    	labelStyle: {top: "-34px", left: "-15.5px"} // position label over main_icon
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
 
    scrollToTop('info_list');
    $('.loading').slideUp('fast');
}

function clear_map() {
    for (var i = 0; i < visible_markers.length; i++) {
        visible_markers[i].setMap(null);
    }
    visible_markers = [];
}
