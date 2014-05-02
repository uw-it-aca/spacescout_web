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

    sbutler1@illinois.edu: removed resetFilters() since it's the same
      as clear_filter() in search.js.
    sbutler1@illinois.edu: fix obvious JSHint bugs.
    sbutler1@illinois.edu: formatting fixes plus hide non-global
      variables/functions.
*/

var requests = [];

// H = Handlebars, $ = jQuery, GM = google.maps
(function (H, $, GM) {
    H.registerHelper('carouselimages', function(spacedata) {
        var space_id = spacedata.id;
        var elements = [];

        var image_url, div_string;
        if (spacedata.images.length > 0) {
            for (var i=0; i < spacedata.images.length; i++) {
                var image_id = spacedata.images[i].id;
                image_url = "background:url(/space/" + space_id + "/image/" + image_id + "/thumb/constrain/width:500)";
                div_string = "<div class='carousel-inner-image item'><div class='carousel-inner-image-inner' style='" + image_url + "'>&nbsp;</div></div>";
                elements.push(div_string);
            }
        } else {
            image_url = "background:url(/static/img/placeholder_noImage_bw.png)";
            div_string = "<div class='carousel-inner-image item'><div class='carousel-inner-image-inner' style='" + image_url + "; background-size: 500px'>&nbsp;</div></div>";
            elements.push(div_string);
        }
        return new H.SafeString(elements.join('\n'));
    });

    H.registerHelper('compare', function(lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

        var operator = options.hash.operator || "==";

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

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    H.registerHelper('addition', function(lvalue, rvalue) {
        if (arguments.length < 2)
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

        return new H.SafeString(Number(lvalue) + Number(rvalue));
    });

    H.registerHelper('formatHours', function(hours) {
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
                var dayMarker = day.charAt(0).toUpperCase();
                // Show two characters for Th, Sa, Su
                if (dayMarker == 'T' && day.charAt(1) == 'h' || dayMarker == 'S' && day.charAt(1) == 'a' || dayMarker == 'S' && day.charAt(1) == 'u') {
                    dayMarker += day.charAt(1);
                }

                formatted[dayMarker] = to12Hour(hours[day]).join(", ");
            }
        });
        formatted = _sortDays(formatted);
        formatted = _groupHours(formatted);
        return new H.SafeString(formatted.join("<br/>"));
    });

    H.registerHelper('alphaOptGroupsHTML', function(list) {
        list.sort();
        var firstletter = null;
        var out = [];
        for (var i=0; i < list.length; i++) {
            if (list[i][0] == firstletter) {
                out.push('<option value="'+list[i]+'">'+list[i]+'</option>');
            } else {
                // select multiple with optgroups will crash mobile Safari
                if (firstletter !== null || !isMobile) {
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
        return new H.SafeString(out.join(''));
    });

    function _groupHours(days) {
        var hours_info = [];

        var day2IntMap = {
            M: 0,
            T: 1,
            W: 2,
            Th: 3,
            F: 4,
            Sa: 5,
            Su: 6
        };

        // Break the sorted days array into its hour ranges by
        // day.
        for (var i = 0; i < days.length; i++) {
            var split = days[i].split(": ");

            var day = split[0];
            var day_hours = split[1].split(", ");

            for (var j = 0; j < day_hours.length; j++) {
                var hour_range = day_hours[j];

                hours_info.push({
                    day: day,
                    day_idx: day2IntMap[day],
                    hour_range: hour_range
                });
            }
        }

        // Do collesing for consecutive midnight ranges
        for (var i = 0; i < hours_info.length; i++) {
            var info = hours_info[i];
            if (!info) {
                // Can happen if we've collesed this range already
                continue;
            }

            var range = info.hour_range.split(" - ");

            if (range[1] == "Midnight") {
                // Look for a hour range in the next day that begins at midnight.
                // If we find one, then collese it into this day and remove it.
                for (var j = i + 1; (j - i) < hours_info.length; j++) {
                    var next_info = hours_info[j % hours_info.length];
                    if (!next_info) {
                        continue;
                    }

                    var next_range = next_info.hour_range.split(" - ");
                    var day_diff = (next_info.day_idx - info.day_idx) % 7;

                    if (day_diff > 1) {
                        // Search beyond the next day
                        break;
                    } else if (day_diff == 1 && next_range[0] == "Midnight") {
                        // Found a day in the next range that begins as midnight.
                        range[1] = next_range[1];
                        hours_info[j % hours_info.length] = null;
                        break;
                    }
                }
                info.hour_range = range.join(" - ");
            }
        }

        // Do collesing for same ranges
        for (var i = 0; i < hours_info.length; i++) {
            var info = hours_info[i];
            if (!info) {
                continue;
            }

            for (var j = i + 1; j < hours_info.length; j++) {
                var next_info = hours_info[j];
                if (!next_info) {
                    continue;
                }

                if (info.hour_range == next_info.hour_range) {
                    info.day += ", " + next_info.day;
                    hours_info[j] = null;
                }
            }
        }

        var result = [];
        for (var i = 0; i < hours_info.length; i++) {
            var info = hours_info[i];
            if (!info) {
                continue;
            }

            result.push(info.day + ": " + info.hour_range);
        }

        return result;
    }

    function _sortDays(days) {
        var ordered = [];
        var order = ["M", "T", "W", "Th", "F", "Sa", "Su"];
        $.each(order, function(day) {
            if (days[order[day]]) {
                ordered.push(order[day] +": " +days[order[day]] );
            }
        });
        return ordered;
    }

    function to12Hour(day) {
        var retData = [];
        for (var j = 0; j < day.length; j++) {
            var data = [day[j][0], day[j][1]];
            for (var i = 0; i < data.length; i++) {
                var time = data[i].split(":");
                if (time[0] == "23" && time[1] == "59") {
                    data[i] = "Midnight";
                } else if (time[0] == "12" && time[1] == "00") {
                    data[i] = "Noon";
                } else {
                    if (time[0] > 12) {
                        time[0] -= 12;
                        time[1] += "PM";
                    } else if (time[0] < 1) {
                        time[0] = 12;
                        time[1] += "AM";
                    } else {
                        time[1] += "AM";
                    }

                    if (time[1] == "00AM") {
                        data[i] = time[0];
                        data[i] += "AM";
                    } else if (time[1] == "00PM") {
                        data[i] = time[0];
                        data[i] += "PM";
                    } else {
                        data[i] = time.join(":");
                    }
                }

                if (data[i] == "12AM") {
                    data[i] = "Midnight";
                }
            }

            if (data[0] == "Midnight" && data[1] == "Midnight") {
                retData[j] = "Open 24 Hours";
            } else {
                retData[j] = data.join(" - ");
            }
        }

        return retData;
    }
    window.to12Hour = to12Hour;

    function default_open_at_filter() {
        // set the default open_at filter to close to now
        var date = new Date();
        var hour = date.getHours();
        var min = date.getMinutes();

        if (min < 16) {
            min = "00";
        } else if (min < 46) {
            min = "30";
        } else {
            min = "00";
            hour++;
        }

        if (hour > 11) {
            $("#ampm-from").val("PM");
            $("#ampm-until").val("PM");
        } else {
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
    window.default_open_at_filter = default_open_at_filter;

    function weekday_from_day(day) {
        var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return (day >= 0 && day <= 6) ? weekdays[day] : '';
    }
    window.weekday_from_day = weekday_from_day;

    function _formatLocationFilter(data) {
        var source = $('#building_list').html();
        var template = H.compile(source);

        if (source) {
            $('#building_list_container').html(template({data: data}));
        }

        //the building multi-select plugin "Chosen" is called here. But it's disabled on mobile
        if ($.cookie('spacescout_search_opts')) {
            var form_opts = JSON.parse($.cookie('spacescout_search_opts'));
            if (form_opts["building_name"]) {
                $('#e9 option').each(function() {
                    if ($.inArray( $(this).val(), form_opts["building_name"]) != -1) {
                        $(this).prop("selected", "selected");
                    }
                });
            }
        }

        var $node = $(".chzn-select");
        if ($node.length > 0 && $node.chosen) {
            $node.chosen({width: "98%"});
        }

        $('#e9.building-location').trigger("liszt:updated");
    }

    function _getLocationBuildings() {
        // populate the location filter list
        var url = '/buildings';
        if (window.default_location !== null) {
            url = url + '?campus=' + window.default_location;
        }
        $.ajax({
            url: url,
            success: _formatLocationFilter
        });
    }

    // Found at http://stackoverflow.com/questions/476679/preloading-images-with-jquery
    function _preloadImages(arrayOfImages) {
        for (var i = 0; i < arrayOfImages.length; i++) {
            $('<img/>')[0].src = arrayOfImages[i];
            // Alternatively you could use:
            // (new Image()).src = this;
        }
    }

    $(document).ready(function() {
/*
        //removed because we use single pin image
        var pinimgs = [];
        for (var i = 1; i <= 30; i++) {
            if (i < 10) {
                pinimgs.push('/static/img/pins/pin0' + i + '.png');
                pinimgs.push('/static/img/pins/pin0' + i + '-alt.png');
            }
            else {
                pinimgs.push('/static/img/pins/pin' + i + '.png');
                pinimgs.push('/static/img/pins/pin' + i + '-alt.png');
            }
        }
        _preloadImages(pinimgs);
*/
        if ($.cookie('default_location')) {
            $('#location_select').val($.cookie('default_location'));
        }

        // handle changing of the location select
        $('#location_select').change(function () {
            var loc_info = $(this).val().split(',');

            window.default_latitude = loc_info[0];
            window.default_longitude = loc_info[1];
            window.default_location = loc_info[2];
            window.default_zoom = loc_info[3];

            // in case a new location gets selected before the map loads
            if (window.spacescout_map !== null) {
                window.spacescout_map.setCenter(new GM.LatLng(window.default_latitude, window.default_longitude));
                window.spacescout_map.setZoom(parseInt(window.default_zoom));
            }
            
            // reset filters for campus change            
            clear_filter();

            run_custom_search();

            window.update_count = true;
            _getLocationBuildings();
            $.cookie('default_location', $(this).val());
            reset_location_filter();
        });

        // handle clicking on map centering buttons
        $('#center_all').live('click', function (e) {
            e.preventDefault();
            if (window.spacescout_map.getZoom() != window.default_zoom) {
                window.spacescout_map.setZoom(parseInt(window.default_zoom));
            }
            window.spacescout_map.setCenter(new GM.LatLng(window.default_latitude, window.default_longitude));
        });

        _getLocationBuildings();

        // handle checkbox and radio button clicks
        $('.checkbox input:checkbox').click(function () {
            var $parent = $(this).parent();
            if (this.checked) {
                $parent.addClass("selected");
            } else {
                $parent.removeClass("selected");
            }   
        }); 

        $('#filter_hours input:radio').change(function () {
            var $parent = $(this).parent();

            $parent.addClass("selected");
            $parent.siblings().removeClass("selected");

            if ($('#hours_list_input').is(':checked')) {
                $('#hours_list_container').show();
            } else {
                $('#hours_list_container').hide();
            }   
        }); 

        $('#filter_location input:radio').change(function () {
            var $parent = $(this).parent();

            $parent.addClass("selected");
            $parent.siblings().removeClass("selected");

            if ($('#building_list_input').is(':checked')) {
                $('#building_list_container').show();
            } else {
                $('#building_list_container').hide();
            }   
        }); 
 
        var escape_key_code = 27;

        $(document).keyup(function (e) {
            if (e.keyCode == escape_key_code) {
                if ($('#filter_block').is(':visible')) {
                    $('#filter_block').slideUp(400, function () {
                        //mobile style stuff
                        if ($('#container').attr("style")) {
                            $('#container').height('auto');
                            $('#container').css('overflow','visible');
                        }   
                    });
//                  $('#filter_button').show();
//                  $('#space_count_container').show();
//                  $('#view_results_button').hide();
//                  $('#cancel_results_button').hide();
                    $('#filter_button').focus();
                }

                if ($('.space-detail').is(':visible')) {
                    closeSpaceDetails();
                } 
            }
        });

        // handle clicking on the "done" button for filters
        $("#view_results_button").click(function () {
//          $('.count').hide();
//          $('.spaces').hide();
            run_custom_search();
            $.cookie('initial_load', false, { expires: 1 });
            $('#filter_button').focus();
        });

        default_open_at_filter();
    });

    function initializeCarousel() {
        // initialize the carousel
        $('.carousel').each(function () {

            var $this = $(this);

            $this.carousel({
                interval: false
            }); 

            // add carousel pagination
            var html = '<div class="carousel-nav" data-target="' + $this.attr('id') + '"><ul>';

            for (var i = 0; i < $this.find('.item').size(); i ++) {
                html += '<li><a';
                if (i === 0) {
                    html += ' class="active"';
                }   
                html += ' href="#">•</a></li>';
            }   

            html += '</ul></li>';
            $this.before(html);

            //set the first item as active
            $this.find(".item:first-child").addClass("active");

            // hide the controls and pagination if only 1 picture exists
            if ($this.find('.item').length == 1) {
                $this.find('.carousel-control').hide();
                $this.prev().hide(); // hide carousel pagination container for single image carousels
            }   

        }).bind('slid', function (e) {
            var $nav = $('.carousel-nav[data-target="' + $(this).attr('id') + '"] ul');
            var index = $(this).find('.item.active').index();
            var item = $nav.find('li').get(index);

            $nav.find('li a.active').removeClass('active');
            $(item).find('a').addClass('active');
        }); 

        $('.carousel-nav a').bind('click', function (e) {
            var index = $(this).parent().index();
            var $carousel = $('#' + $(this).closest('.carousel-nav').data('target'));

            $carousel.carousel(index);
            e.preventDefault();
        }); 

        resizeCarouselMapContainer();
    }
    window.initializeCarousel = initializeCarousel;

    function initMapCarouselButtons() {
        $('.space-image-map-buttons button').on('click', function (e) {
            var $target = $(this),
                active = $target.hasClass('active'),
                $container = $target.closest('.space-detail'),
                coords;

            if (!active) {
                if ($target.attr('id') == 'carouselControl') {
                    $('#spaceCarouselContainer', $container).show();
                    $('#spaceMap', $container).hide();
                    $('#carouselControl.btn', $container).attr("tabindex", -1).attr("aria-selected", true);
                    $('#mapControl.btn', $container).attr("tabindex", 0).attr("aria-selected", false);
                } else if ($target.attr('id') == 'mapControl') {
                    $('#spaceCarouselContainer', $container).hide();
                    $('#spaceMap', $container).show();
                    $('#carouselControl.btn', $container).attr("tabindex", 0).attr("aria-selected", false);
                    $('#mapControl.btn', $container).attr("tabindex", -1).attr("aria-selected", true);
                    coords = JSON.parse($target.data('location'));
                    _getSpaceMap($container, coords[0], coords[1]);
                }
            }
        });
    }
    window.initMapCarouselButtons = initMapCarouselButtons;

    function resizeCarouselMapContainer() {
        // get the width
        var containerW;
        if ($('.image-container').width() > $('.map-container').width()) {
            containerW = $('.image-container').width();
        } else if ($('.map-container').width() > $('.image-container').width()) {
            containerW = $('.map-container').width();
        }

        // calcuate height based on 3:2 aspect ratio
        var containerH = containerW / 1.5;

        $('.carousel').height(containerH);
        $('.carousel-inner-image').height(containerH);
        $('.carousel-inner-image-inner').height(containerH);
        $('.map-container').height(containerH);
    }
    window.resizeCarouselMapContainer = resizeCarouselMapContainer;

    function _getSpaceMap(container, lat, lon) {
        if (window.space_latitude) {
          lat = window.space_latitude;
        }

        if (window.space_longitude) {
          lon = window.space_longitude;
        }

        var mapOptions = {
          zoom: 17,
          center: new GM.LatLng(lat , lon),
          mapTypeId: GM.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false
        };

        var map = new GM.Map($('#spaceMap', container).get(0), mapOptions);

        var image = '/static/img/pins/pin00.png';

        var spaceLatLng = new GM.LatLng(lat , lon);
        var spaceMarker = new GM.Marker({
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
        if (url !== null) {
            text = text.replace(url, "<a href='" + url + "' target='_blank'>" + url + "</a>");
            $("#ei_reservation_notes").html(text);
        }
    }
    window.replaceUrls = replaceUrls;

    function closeSpaceDetails() {
        var the_spot_id = $('.space-detail-inner').attr("id");
        the_spot_id = "#" + the_spot_id.replace(/[^0-9]/g, '');
        $('.space-detail').hide("slide", { direction: "right" }, 400, function () {
            $('.space-detail-container').remove();
        });

        // deselect selected space in list
        $('#info_items li').removeClass('selected');
        $(the_spot_id).focus();
    }
    window.closeSpaceDetails = closeSpaceDetails;

})(Handlebars, jQuery, google.maps);








