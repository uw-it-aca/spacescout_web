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

    $(document).ready(function () {
        window.spacescout_favorites.favorites = window.spacescout_favorites_list;
    });

    window.spacescout_favorites = window.spacescout_favorites || {
        k: {
            'favorites_count_container': '.favorites_count_container',
            'favorites_count_template': '#favorites_count',
            'favorites_total_container': '.favorites_total_container',
            'favorites_total_template': '#favorites_total',
            'favorites_card_container': '.favorites_card_container',
            'favorites_card_template': '#favorites_card'
        },

        favorites: window.spacescout_favorites_list,

        update_count: function () {
            var self = this,
                source = $(self.k.favorites_count_template),
                template;

            if (source.length) {
                template = Handlebars.compile(source.html().trim());
                $(this.k.favorites_count_container).each(function () {
                    $(this).html(template({count: self.favorites ? self.favorites.length : 0}));
                });
            }

            source = $(self.k.favorites_total_template);
            if (source.length) {
                template = Handlebars.compile(source.html().trim());
                $(this.k.favorites_total_container).each(function () {
                    var total = self.favorites ? self.favorites.length : 0,
                        plural = (total == 1) ? '' : 's';

                    $(this).html(template({ total: total, plural: plural }));
                });
            }
        },

        update_search_result: function () {
            var self = this,
                detail_node = $('div[id^=detail_container_]'),
                detail_id = detail_node.length ? parseInt(detail_node.prop('id').match(/^detail_container_(\d+)$/)[1]) : null;

            $('#info_items .view-details button .space-detail-fav').each(function () {
                var node = $(this),
                    id = parseInt(node.parent().prop('id'));

                if (self.is_favorite(id)) {
                    node.show();
                    if (id == detail_id) {
                        $('.space-detail-fav', detail_node).removeClass('space-detail-fav-unset').addClass('space-detail-fav-set');
                    }
                } else {
                    node.hide();
                    if (id == detail_id) {
                        $('.space-detail-fav', detail_node).removeClass('space-detail-fav-set').addClass('space-detail-fav-unset');
                    }
                }
            });
        },

        update_cards: function () {
            var container = $(this.k.favorites_card_container),
                campuses = {}, campus, campus_name,
                source, template, i, j, n, blank, campus_select, opts,
                self = this,
                insert_card = function (i, space) {
                    var spot = $('spot_' + space.id),
                        source = $(self.k.favorites_card_template).html(),
                        template = Handlebars.compile(source),
                        type = [], card;

                    if ($.isArray(space.type)) {
                        $.each(space.type, function () {
                            type.push(gettext(this));
                        });
                    }

                    space.type = type.join(', ');
                    space.extended_info.noise_level = gettext(space.extended_info.noise_level);
                    space.extended_info.food_nearby = gettext(space.extended_info.food_nearby);
                    space.has_reservation_notes = ( space.extended_info.reservation_notes != null);
                    space.has_notes = ( ( space.extended_info.access_notes != null) || space.has_reservation_notes );
                    space.has_resources = ( space.extended_info.has_computers != null ||
                                            space.extended_info.has_displays != null ||
                                            space.extended_info.has_outlets != null ||
                                            space.extended_info.has_printing != null ||
                                            space.extended_info.has_projector != null ||
                                            space.extended_info.has_scanner != null ||
                                            space.extended_info.has_whiteboards != null );

                    card = $(template(space));

                    if (spot.length == 0) {
                        container.append(card);
                    }

                    $.event.trigger('favoriteCardLoaded', [ card, space ]);
                };

            if (container.length == 1 && $.isArray(this.favorites)) {
                // sort by campus
                $.each(this.favorites, function () {
                    if (campuses != null) {
                        if (this.extended_info.hasOwnProperty('campus')
                            && this.extended_info.campus.length) {
                            if (campuses.hasOwnProperty(this.extended_info.campus)) {
                                campuses[this.extended_info.campus].push(this);
                            } else {
                                campuses[this.extended_info.campus] = [this];
                            }
                               
                        } else {
                            campuses = null;
                        }
                    }
                });

                blank = Handlebars.compile($('#blank_card').html())({ back: window.spacescout_referrer });
                campus_select = $('#location_select');

                if (campuses && Object.keys(campuses).length > 0
                    && (Object.keys(campuses).length > 1
                        || !campuses.hasOwnProperty($('option:selected', campus_select).val().split(',')[2]))) {
                    template = Handlebars.compile($('#campus_label').html());

                    opts = $('option', campus_select);
                    i = campus_select.prop('selectedIndex');

                    for (j = 0; j < opts.size(); j += 1) {
                        campus = $(opts[i]).val().split(',')[2];
                        campus_name = opts[i].innerHTML;
                        i = ((i + 1) % opts.size());

                        container.append(template({ campus: campus_name + ' Campus' }));

                        if (campuses.hasOwnProperty(campus)) {
                            $.each(campuses[campus], insert_card);
                        }

                        if (blank) {
                            container.append(blank);
                            blank = null;
                        }
                    }
                } else {
                    $.each(this.favorites, insert_card);
                    container.append(blank);
                }

                replaceReservationNotesUrls();

                $.event.trigger('favoritesLoaded', [ this.favorites ]);
            }
        },

        update_favorites_button: function (id) {
            var fav_button = $('button#favorite_space'),
                fav_icon = $('.space-detail-fav', fav_button),
                fav_icon_i = $('i', fav_icon),
                setFavoritedButton = function (id) {
                    var title = fav_button.attr('title').replace(/ favorite /, ' unfavorite ');

                    fav_icon.removeClass('space-detail-fav-unset').addClass('space-detail-fav-set');
                    fav_icon.parent().find('span:last').text(gettext('favorited'));
                    fav_button.attr('title', title);
                    if (id) {
                        $('button#' + id + ' .space-detail-fav').show();
                    }
                },
                unsetFavoritedButton = function(id) {
                    var title = fav_button.attr('title').replace(/ unfavorite /, ' favorite ');

                    fav_icon.removeClass('space-detail-fav-set').addClass('space-detail-fav-unset');
                    fav_icon.parent().find('span:last').text(gettext('favorite'));
                    fav_button.attr('title', title);
                    if (id) {
                        $('button#' + id + ' .space-detail-fav').hide();
                    }
                };

            if (fav_icon.is(':visible')) {
                var authenticated_user = window.spacescout_authenticated_user.length > 0;

                if (authenticated_user && window.spacescout_favorites.is_favorite(id)) {
                    setFavoritedButton();
                } else {
                    unsetFavoritedButton();
                }

                fav_icon.unbind();

                fav_button.click(function (e) {
                    if (!authenticated_user) {
                        $.cookie('space_set_favorite', JSON.stringify({ id: id }));
                        window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
                    }

                    window.spacescout_favorites.toggle(id);
                });

                $(document).on('spaceFavoriteSet', function (e, id) {
                    setFavoritedButton(id);
                });

                $(document).on('spaceFavoriteClear', function (e, id) {
                    unsetFavoritedButton(id);
                });

                if (authenticated_user) {
                    var set_favorite = $.cookie('space_set_favorite'),
                        json_favorite = set_favorite ? JSON.parse(set_favorite) : null;

                    if (json_favorite) {
                        window.spacescout_favorites.set(json_favorite.id);
                    }

                    $.removeCookie('space_set_favorite');
                }
            }
        },

        load: function () {
            var self = this;

            $.ajax({
                url: '/web_api/v1/user/me/favorites',
                success: function (data) {
                    if ($.isArray(data)) {
                        self.favorites = data;
                        self.update();
                    }
                    else {
                        console.log('Unrecognized favorites response: ' + data);
                    }
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log('Unable to load favorites: ' + xhr.responseText);
                }
            });
        },

        update: function () {
            this.update_count();
            this.update_search_result();
            this.update_cards();
        },

        is_favorite: function (id) {
            var fav = false;

            if (this.favorites) {
                fav = (this.index(id) >= 0);
            } else {
                $.ajax({
                    url: '/web_api/v1/user/me/favorite/' + id,
                    type: "GET",
                    async: false,
                    success: function (data) {
                        fav = (typeof data === 'boolean') ? data : false;
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

        toggle: function (id) {
            if (this.is_favorite(id)) {
                this.clear(id);
            } else {
                this.set(id);
            }

            this.update_count();
        },

        set: function (id) {
            var self = this;

            if (!this.is_favorite(id)) {
                $.ajax({
                    url: '/web_api/v1/user/me/favorite/' + id,
                    dataType: 'json',
                    contentType: "application/json",
                    data: JSON.stringify({}),
                    type: "PUT",
                    success: function (data) {
                        var i = 0;
                        if (self.favorites) {
                            for (i = 0; i < self.favorites.length; i++) {
                                // Bail out early - SPOT-1651
                                if (self.favorites[i].id == id) {
                                    if (on_set) {
                                        on_set.call();
                                        return;
                                    }
                                }
                            }
                            self.favorites.push({
                                id: id,
                                incomplete: true
                            });
                        }

                        self.update_count();
                        $.event.trigger('spaceFavoriteSet', [ id ]);
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.log('Unable to set favorite: ' + xhr.responseText);
                    }
                });
            }
        },

        clear: function (id) {
            var self = this;

            $.ajax({
                url: '/web_api/v1/user/me/favorite/' + id,
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
                    $.event.trigger('spaceFavoriteClear', [ id ]);
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log('Unable to unset favorite: ' + xhr.responseText);
                }
            });
        }
    };


    if ($('.favorites_nav').length > 0) {
        
        $(document).on('favoriteCardLoaded', function (e, card, fav) {
            var now = new Date(),
                hour = now.getHours(),
                minute = now.getMinutes(),
                day = weekday_from_day(now.getDay()).toLowerCase(),
                formatted = 'Closed';

            $('.space-detail-is-closed', card).show();

            loadRatingsAndReviews(fav.id, $('.space-ratings-and-reviews', card), card);

            if (fav.available_hours[day].length > 0) {
                $.each(fav.available_hours[day], function() {
                    var o = this[0].replace(/^0+/, '').split(':'),
                        c = this[1].replace(/^0+/, '').split(':'),
                        o_h = o[0].length ? parseInt(o[0]) : 0,
                        o_m = o[1].length ? parseInt(o[1]) : 0,
                        c_h = c[0].length ? parseInt(c[0]) : 0,
                        c_m = c[1].length ? parseInt(c[1]) : 0;
                    
                    if ((hour > o_h && hour < c_h)
                        || (hour == o_h && minute > o_m)
                        || (hour == c_h && minute < c_m)) {
                        $('.space-detail-is-open', card).show();
                        $('.space-detail-is-closed', card).hide();
                    }
                });
                
                formatted = to12Hour(fav.available_hours[day]).join(", ");
            }
            
            $('.space-info-hours-today span', card).html(formatted);
            
            $('.space-info-more-detail a', card).click(function (e) {
                var more_div = $(e.target).parent();
                
                more_div.slideUp('fast');
                more_div.next().slideDown('fast');
            });
            
            $('.space-info-less-detail a', card).click(function (e) {
                var ul = $(e.target).closest('ul'),
                    reviews = $('.space-reviews-review', ul);
                
                ul.slideUp('fast', function () {
                    var top = card.offset().top,
                        scrolltop = $(document).scrollTop();

                    if (top < scrolltop) {
                        $('html,body').animate({
                            scrollTop: top
                        }, 400, 'swing');
                    }
                });
                ul.prev().slideDown('fast');
                
                if (reviews.length > window.spacescout_reviews.pagination) {
                    reviews.each(function (i) {
                        if (i >= window.spacescout_reviews.pagination) {
                            $(this).hide();
                        }
                    });

                    $('.more-space-reviews', ul).show();
                }
            });
            
            $('.space-detail-fav', card).click(function (e) {
                window.spacescout_favorites.clear(parseInt($(this).attr('data-id')));
            });

            $(document).on('spaceFavoriteClear', function (e, id) {
                var container = $('#spot_'+id).closest('.space-detail-container');

                container.hide({
                    effect: 'fade',
                    duration: 800,
                    complete: function () {
                        container.remove();
                    }
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
                var template = Handlebars.compile($('#images_template').html());
                var data = [];
                // only load initial image
                data.push({ id: fav.id, image_id: fav.images[0].id });
                $('.carousel-inner', card).html(template({ data: data }));
            } else {
                var template = Handlebars.compile($('#no_images_template').html());
                $('.carousel-inner', card).html(template({ static_url: window.spacescout_static_url }));
            }
            
            if (fav.has_reservation_notes) {
                var url = fav.extended_info.reservation_notes.match(/(http:\/\/[^\s]+)/);
                
                if (url) {
                    var template = Handlebars.compile($('#reservation_cue').html());
                    $('.space-info-reservation-cue', card).html(template({ url: url[1] })).show();
                }
            }
        });

        $(document).on('favoritesLoaded', function (e, data) {
            var h, d;

            initializeCarousel();
            initMapCarouselButtons();

            $('.share_space').on('click', function (e) {
                e.preventDefault();
                h = $(e.target).prop('href'),

                window.location.href = h
                    + '?back=' + encodeURIComponent('/favorites'
                                                    + '?back=' + encodeURIComponent(window.spacescout_referrer)
                                                    + '#spot_' + h.match(/\d+$/)[0]);
            });

            if (window.location.hash.length > 1) {
                d = $(window.location.hash).offset().top;

                if (d > $(document).height() - $(window).height()) {
                    d = $(document).height() - $(window).height();
                }

                //go to destination
                $('html,body').animate({
                    scrollTop: d
                }, 1000, 'swing');
                
                $(window.location.hash).parent().find('.space-info-more-detail a').click();
            }

            $('.space-detail-fav-button').hover(function() {
                $(this).addClass('space-detail-fav-button-active');
            }, function () {
                $(this).removeClass('space-detail-fav-button-active');
            });

            $('.space-detail-fav-button').focus(function() {
                $(this).addClass('space-detail-fav-button-active');
            });

            $('.space-detail-fav-button').blur(function() {
                $(this).removeClass('space-detail-fav-button-active');
            });
        });

        $('#back_link').click(function (e) {
            e.preventDefault();
            window.history.back();
        });

        window.spacescout_favorites.load();

    }

})(this);

