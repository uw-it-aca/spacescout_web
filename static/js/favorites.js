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
                source = $(self.k.favorites_count_template),
                template;

            if (source.length) {
                template = Handlebars.compile(source.html().trim());
                $(this.k.favorites_count_container).each(function () {
                    $(this).html(template({count: self.favorites.length}));
                });
            }
        },

        update_search_result: function () {
            var self = this,
                detail_node = $('div[id^=detail_container_]'),
                detail_id = detail_node.length ? parseInt(detail_node.prop('id').match(/^detail_container_(\d+)$/)[1]) : null;

            $('button .space-detail-fav').each(function () {
                var node = $(this),
                    id = parseInt(node.parent().prop('id'));

                if (self.is_favorite(id)) {
                    node.show();
                    if (id == detail_id) {
                        $('.space-detail-fav', detail_node).addClass('space-detail-fav-set');
                    }
                } else {
                    node.hide();
                    if (id == detail_id) {
                        $('.space-detail-fav', detail_node).removeClass('space-detail-fav-set');
                    }
                }
            });
        },

        update_cards: function (on_card_load) {
            var container = $(this.k.favorites_card_container);
            var source, template, html = '';

            if (container.length == 1) {
                source = $(this.k.favorites_card_template).html();
                template = Handlebars.compile(source),
                self = this;

                $.each(this.favorites, function () {
                    var spot = $('spot_' + this.id),
                        type = [],
                        i, card;

                    $.each(this.type, function () {
                        type.push(gettext(this));
                    });

                    this.type = type.join(', ');
                    this.extended_info.noise_level = gettext(this.extended_info.noise_level);
                    this.extended_info.food_nearby = gettext(this.extended_info.food_nearby);
                    this.has_reservation_notes = ( this.extended_info.reservation_notes != null);
                    this.has_notes = ( ( this.extended_info.access_notes != null) || this.has_reservation_notes );
                    this.has_resources = ( this.extended_info.has_computers != null || this.extended_info.has_displays != null || this.extended_info.has_outlets != null || this.extended_info.has_printing != null || this.extended_info.has_projector != null || this.extended_info.has_scanner != null || this.extended_info.has_whiteboards != null );

                    card = $(template(this));

                    if (spot.length == 0) {
                        card.insertBefore('#space-detail-blank', container);
                    }

                    if (on_card_load) {
                        on_card_load.apply(self, [card, this]);
                    }
                });

                initializeCarousel();
            }
        },

        load: function (on_card_load) {
            var self = this;

            $.ajax({
                url: 'api/v1/user/me/favorites',
                success: function (data) {
                    self.favorites = data ? data : [];
                    self.update(on_card_load);
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log('Unable to load favorites: ' + xhr.responseText);
                }
            });
        },

        update: function (on_card_load) {
            this.update_count();
            this.update_search_result();
            this.update_cards(on_card_load);
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

})(this);

