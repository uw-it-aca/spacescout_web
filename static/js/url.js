/*
    Copyright 2014 UW Information Technology, University of Washington

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

    Changes:

    =================================================================

*/
(function(){

    window.spacescout_url = window.spacescout_url || {

        load: function (path) {
            this.dispatch(this.parse_path(path));
        },

        dispatch: function (state) {
            if (!state) {
                state = this.parse_path(window.location.pathname);
            }

            switch (state.local_path) {
            case 'favorites':
                break;
            case '':
                if (window.default_location != state.campus
                    || this.encode_current_search() != state.search) {
                    $('#location_select option').each(function (i) {
                        var location = $(this).val().split(',');
                        if (location[2] == state.campus) {
                            window.default_latitude = location[0];
                            window.default_longitude = location[1];
                            window.default_location = location[2];
                            window.default_zoom = parseInt(location[3]);
                            $(this).parent().prop('selectedIndex', i);
                        }
                    });

                    window.spacescout_search_options = this.decode_search_terms(state.search);
                    clear_filter();
                    repopulate_filters(window.spacescout_search_options);
                    run_custom_search();
                } else if (state.id) {
                    if (window.spacescout_web_mobile) {
                        window.spacescout_web_mobile.show_space_detail(state.id);
                    } else {
                        data_loaded();
                    }
                } else if ($('.space-detail-container').length) {
                    if (window.spacescout_web_mobile) {
                        window.spacescout_web_mobile.show_main_app();
                    } else {
                        closeSpaceDetails();
                    }
                }
                break;
            default:
                break;
            }
        },

        push: function (id) {
            var url = [''],
                path,
                campus = window.default_location,
                search = this.encode_current_search();

            url.push(campus);

            if (search && search.length) {
                url.push(search);
            }

            if (id) {
                url.push(id);
            }

            path = url.join('/');

            // only push fresh references
            if (decodeURIComponent(window.location.pathname) != path) {
                history.pushState({ campus: campus, search: search, id: id, local_path: '' },
                                  '', path);
            }
        },

        replace: function (id) {
            var url = [''],
                campus = window.default_location,
                search = this.encode_current_search();

            url.push(campus);

            if (search && search.length) {
                url.push(search);
            }

            if (id) {
                url.push(id);
            }

            history.replaceState({ campus: campus, search: search, id: id },
                                 '',
                                 url.join('/'));
        },

        space_id: function (url) {
            var o = this.parse_path(url);

            return o ? o.id : null;
        },

        parse_path: function (path) {
            var state = {},
                m = path.match(/^\/([a-zA-Z]+)?(\/([a-z][^/]*))?((\/(\d*))?(\/.*)?)?$/);

            if (m) {
                // 
                $('#location_select option').each(function (i) {
                    var location = $(this).val().split(',');
                    if (location[2] == m[1]) {
                        state.campus = m[1];
                    }
                });

                if (state.campus) {
                    state.local_path = '';
                } else {
                    state.local_path = m[1];
                    state.campus = null;
                }

                state.search = (m[3] && m[3].length) ? decodeURIComponent(m[3]) : 'cap:1';
                state.id = (m[6] && m[6].length) ? parseInt(m[6]) : undefined;
            }

            return state;
        },

        encode_current_search: function () {
            return this.encode_search_terms(window.spacescout_search_options);
        },

        encode_search_terms: function (opts) {
            var terms = [], a, s;

            if (opts) {
                if (opts.hasOwnProperty('type')) {
                    a = [];

                    $.each(opts["type"], function () {
                        a.push(this);
                    });

                    if (a.length) {
                        terms.push('type:' + a.join(','));
                    }
                }

                if (opts["extended_info:reservable"]) {
                    terms.push('reservable');
                }

                if (opts["capacity"]) {
                    terms.push('cap:' + opts["capacity"]);
                }

                if (opts["open_at"]) {
                    terms.push('open:' + opts["open_at"]);
                }

                if (opts["open_until"]) {
                    terms.push('close:' + opts["open_until"]);
                }

                if (opts["building_name"]) {
                    terms.push('bld:' + opts["building_name"]);
                }

                // set resources
                if (opts["extended_info:has_whiteboards"]) {
                    terms.push('rwb');
                }
                if (opts["extended_info:has_outlets"]) {
                    terms.push('rol');
                }
                if (opts["extended_info:has_computers"]) {
                    terms.push('rcp');
                }
                if (opts["extended_info:has_scanner"]) {
                    terms.push('rsc');
                }
                if (opts["extended_info:has_projector"]) {
                    terms.push('rpj');
                }
                if (opts["extended_info:has_printing"]) {
                    terms.push('rpr');
                }
                if (opts["extended_info:has_displays"]) {
                    terms.push('rds');
                }

                // set noise level
                if (opts.hasOwnProperty("extended_info:noise_level")) {
                    a = [];

                    $.each(opts["extended_info:noise_level"], function () {
                        a.push(this);
                    });

                    if (a.length) {
                        terms.push('noise:' + a.join(','));
                    }
                }

                // set lighting
                if (opts["extended_info:has_natural_light"]) {
                    terms.push('natl');
                }

                // set food/coffee
                if (opts.hasOwnProperty("extended_info:food_nearby")) {
                    a = [];

                    $.each(opts["extended_info:food_nearby"], function () {
                        a.push(this);
                    });

                    if (a.length) {
                        terms.push('food:' + a.join(','));
                    }
                }
            }

            return (terms.length) ? terms.join('|') : null;
        },

        decode_search_terms: function (raw) {
            var opts = {},
                terms = raw ? raw.split('|') : [];

            $.each(terms, function () {
                var m = this.match(/^([^:]+)(:(.*))?$/),
                    v;

                if (!m) return;

                v = m[3];
                switch (m[1]) {
                case 'type':
                    opts['type'] = [];
                    $.each(v.split(','), function () {
                        opts['type'].push(this);
                    });

                    break;
                case 'reservable':
                    opts["extended_info:reservable"] = true;
                    break;
                case 'cap':
                    opts["capacity"] = v ? v : 1;
                    break;
                case 'open':
                    opts["open_at"] = v;
                    break;
                case 'close' :
                    opts["open_until"] = v;
                    break;
                case 'bld' :
                    opts["building_name"] = [];
                    $.each(v.split(','), function () {
                        opts['building_name'].push(this);
                    });

                    break;
                case 'rwb' :
                    opts["extended_info:has_whiteboards"] = true;
                    break;
                case 'rol' :
                    opts["extended_info:has_outlets"] = true;
                    break;
                case 'rcp' :
                    opts["extended_info:has_computers"] = true;
                    break;
                case 'rsc' :
                    opts["extended_info:has_scanner"] = true;
                    break;
                case 'rpj' :
                    opts["extended_info:has_projector"] = true;
                    break;
                case 'rpr' :
                    opts["extended_info:has_printing"] = true;
                    break;
                case 'rds' :
                    opts["extended_info:has_displays"] = true;
                    break;
                case 'natl' :
                    opts["extended_info:has_natural_light"] = true;
                    break;
                case 'noise' :
                    opts["extended_info:noise_level"] = [];
                    $.each(v.split(','), function () {
                        opts["extended_info:noise_level"].push(this);
                    });

                    break;
                case 'food' :
                    opts["extended_info:food_nearby"] = [];
                    $.each(v.split(','), function () {
                        opts["extended_info:food_nearby"].push(this);
                    });

                    break;
                default:
                    break;
                }
            });

            return opts;
        }

    };

    $(window).bind('popstate', function (e) {
       if (e.originalEvent.state) {
            window.spacescout_url.dispatch(e.originalEvent.state);
       } else {
            window.spacescout_url.load(window.location.pathname);
       }
    });

    $(document).on('searchResultsLoaded', function (e, data) {
        var state = window.spacescout_url.parse_path(window.location.pathname);

        if (window.location.pathname == '' || window.location.pathname == '/') {
            window.spacescout_url.replace();
        }

        if (state.id) {
            $.event.trigger('loadSpaceDetail', [ state.id ]);
        }
    });


})(this);
