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
    sbutler1@illinois.edu: fixed suggested by JSHint, also use some
      common jQuery conventions.
*/

// H = Handlebars, $ = jQuery
(function (H, $) {

    window.spacescout_favorites = window.spacescout_favorites || {
        k: {
            'favorites_count_container': '.favorites_count_container',
            'favorites_count_template': '#favorites_count',
            'favorites_card_container': '.favorites_card_container',
            'favorites_card_template': '#favorites_card'
        },

        favorites: undefined,

        update_count: function () {
            var self = this,
                $source = $(self.k.favorites_count_template),
                template;

            if ($source.length) {
                template = H.compile($source.html().trim());
                $(this.k.favorites_count_container).each(function () {
                    $(this).html(template({count: self.favorites.length}));
                });
            }
        },

        update_search_result: function () {
            var self = this,
                $detail_node = $('div[id^=detail_container_]'),
                detail_id = $detail_node.length ? parseInt($detail_node.prop('id').match(/^detail_container_(\d+)$/)[1]) : null;

            $('button .space-detail-fav').each(function () {
                var $node = $(this),
                    id = parseInt($node.parent().prop('id'));

                if (self.is_favorite(id)) {
                    $node.show();
                    if (id == detail_id) {
                        $('.space-detail-fav', $detail_node).addClass('space-detail-fav-set');
                    }
                } else {
                    $node.hide();
                    if (id == detail_id) {
                        $('.space-detail-fav', $detail_node).removeClass('space-detail-fav-set');
                    }
                }
            });
        },

        update_cards: function (on_card_load, on_finish) {
            var $container = $(this.k.favorites_card_container),
                source, template;

            if ($container.length == 1 && $.isArray(this.favorites)) {
                source = $(this.k.favorites_card_template).html();
                template = H.compile(source);
                var self = this;

                $.each(this.favorites, function () {
                    var $spot = $('spot_' + this.id),
                        type = [], $card;

                    if ($.isArray(this.type)) {
                        $.each(this.type, function () {
                            type.push(gettext(this));
                        });
                    }

                    this.type = type.join(', ');
                    this.extended_info.noise_level = gettext(this.extended_info.noise_level);
                    this.extended_info.food_nearby = gettext(this.extended_info.food_nearby);
                    this.has_reservation_notes = !!this.extended_info.reservation_notes;
                    this.has_notes = ( this.extended_info.access_notes || this.has_reservation_notes );
                    this.has_resources = ( this.extended_info.has_computers || this.extended_info.has_displays || this.extended_info.has_outlets || this.extended_info.has_printing || this.extended_info.has_projector || this.extended_info.has_scanner || this.extended_info.has_whiteboards );

                    $card = $(template(this));

                    if ($spot.length == 0) {
                        $card.insertBefore('#space-detail-blank', $container);
                    }

                    if (on_card_load) {
                        on_card_load.apply(self, [$card, this]);
                    }
                });


                if (on_finish) {
                    on_finish.apply(self, []);
                }

            }
        },

        load: function (on_card_load, on_finish) {
            var self = this;

            $.ajax({
                url: 'api/v1/user/me/favorites',
                success: function (data) {
                    self.favorites = data ? data : [];
                    self.update(on_card_load, on_finish);
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log('Unable to load favorites: ' + xhr.responseText);
                }
            });
        },

        update: function (on_card_load, on_finished) {
            this.update_count();
            this.update_search_result();
            this.update_cards(on_card_load, on_finished);
        },

        is_favorite: function (id) {
            var fav = false;

            if (this.favorites) {
                fav = (this.index(id) >= 0);
            } else {
                $.ajax({
                    url: 'api/v1/user/me/favorite/' + id,
                    type: "GET",
                    async: false,
                    success: function (data) {
                        fav = data;
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.log('Unable to get favorite: ' + xhr.responseText);
                    }
                });
            }

            return fav;
        },

        index: function (id) {
            var i;

            if (this.favorites) {
                for (i = 0; i < this.favorites.length; i += 1) {
                    if (this.favorites[i].id == id) {
                        return i;
                    }
                }
            }

            return -1;
        },

        toggle: function (id, on_set, on_clear) {
            if (this.is_favorite(id)) {
                this.clear(id, on_clear);
            } else {
                this.set(id, on_set);
            }

            this.update_count();
        },

        set: function (id, on_set) {
            var self = this;

            if (!this.is_favorite(id)) {
                $.ajax({
                    url: 'api/v1/user/me/favorite/' + id,
                    dataType: 'json',
                    contentType: "application/json",
                    data: JSON.stringify({}),
                    type: "PUT",
                    success: function (data) {
                        if (self.favorites) {
                            self.favorites.push({
                                id: id,
                                incomplete: true
                            });
                        }

                        self.update_count();
                        if (on_set) {
                            on_set.call();
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.log('Unable to set favorite: ' + xhr.responseText);
                    }
                });
            }
        },

        clear: function (id, on_clear) {
            var self = this;

            $.ajax({
                url: 'api/v1/user/me/favorite/' + id,
                dataType: 'json',
                type: "DELETE",
                success: function (data) {
                    if (self.favorites) {
                        var index = self.index(id);

                        if (index >= 0) {
                            self.favorites.splice(index, 1);
                        }
                    }

                    self.update_count();
                    if (on_clear) {
                        on_clear.call();
                    }
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log('Unable to unset favorite: ' + xhr.responseText);
                }
            });
        }
    };

    if ($('.favorites_nav').length > 0) {
        window.spacescout_favorites.load(function (card, fav) {
            var now = new Date(),
                hour = now.getHours(),
                minute = now.getMinutes(),
                day = weekday_from_day(now.getDay()).toLowerCase(),
                formatted = 'Closed',
                o, c;
    
            if (fav.available_hours[day].length > 0) {
                $.each(fav.available_hours[day], function() {
                    this[0] = this[0].replace(/^0+/, '');
                    this[1] = this[1].replace(/^0+/, '');
                    o = this[0].split(':');
                    c = this[1].split(':');
    
                    if ((hour > parseInt(o[0]) && hour < parseInt(c[0]))
                        || (hour == parseInt(o[0]) && minute > parseInt(o[1]))
                        || (hour == parseInt(c[0]) && minute < parseInt(c[1]))) {
                        $('.space-detail-is-open', card).show();
                    }
                });
    
                formatted = to12Hour(fav.available_hours[day]).join(", ");
            }
    
            $('.space-info-hours-today span', card).html(formatted);
    
            $('.space-info-more-detail a', card).click(function (e) {
                var $more_div = $(e.target).parent();
    
                $more_div.slideUp('fast');
                $more_div.next().slideDown('fast');
            });
    
            $('.space-info-less-detail a', card).click(function (e) {
                var $ul = $(e.target).closest('ul');
    
                $ul.slideUp('fast');
                $ul.prev().slideDown('fast');
            });
    
            $('.space-detail-fav', card).tooltip({ placement: 'right',
                                                   title: 'Remove this space from Favorites' });
            $('.space-detail-fav', card).click(function (e) {
                var id = parseInt($(this).attr('data-id'));
                var $container = $(this).closest('.space-detail-container');
                var tooltip = $(this).tooltip('hide');
    
                window.spacescout_favorites.clear(id, function () {
                    $container.hide({ effect: 'fade', duration: 800,  complete: function () { this.remove(); } });
                });
            });
    
            var bld_code = fav.location.building_name.match(/.*\(([A-Z ]+)\)( [a-zA-Z]+)?$/);
            if (bld_code) {
                $('.space-detail-building', card).html(bld_code[1] + (bld_code[2] ? bld_code[2] : ''));
            } else {
                $('.space-detail-building', card).html(fav.location.building_name);
            }
    
            // Load image carousel
            if (fav.hasOwnProperty('images') && fav.images.length > 0) {
                var template = H.compile($('#images_template').html());
                var data = [];
                $.each(fav.images, function () {
                    data.push({ id: fav.id, image_id: this.id });
                });
    
                $('.carousel-inner', card).html(template({ data: data }));
            } else {
                var template = H.compile($('#no_images_template').html());
                $('.carousel-inner', card).html(template({ static_url: window.spacescout_static_url }));
            }
    
            if (fav.has_reservation_notes) {
                var url = fav.extended_info.reservation_notes.match(/(http:\/\/[^\s]+)/);
    
                if (url) {
                   var template = H.compile($('#reservation_cue').html());
                   $('.space-info-reservation-cue', card).html(template({ url: url[1] })).show();
                }
            }
        },
        function () {
            initializeCarousel();
            initMapCarouselButtons();
        });
    }

})(Handlebars, jQuery);

