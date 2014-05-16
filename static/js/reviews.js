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

window.spacescout_reviews = {
    review_char_limit: 300,
    pagination: 5
};

function setupRatingsAndReviews(data) {

    var review_rating_values = {
        'one-star': {
            key: gettext('terrible'),
            val: 1
        },
        'two-star': {
            key: gettext('poor'),
            val: 2
        },
        'three-star': {
            key: gettext('average'),
            val: 3
        },
        'four-star': {
            key: gettext('good'),
            val: 4
        },
        'five-star': {
            key: gettext('excellent'),
            val: 5
        }
    };

    $('.space-ratings-and-reviews').html(Handlebars.compile($('#space_reviews').html())());

    if (data && data.length) {
        showRatingEditorButton();
    }

    $('.space-ratings-and-reviews .write-a-review.add-a-review').on('click', function (e) {
        showRatingEditor();
    });

    $('.space-review-compose textarea').bind('input', function (e) {
        var text = $(this).val(),
            not_counted = (text.match(/[\x7c\s@\.,\\\/#!?\$%\^&\*;:{}\[\]<>=\-_`'"~()\+]+/g) || []).join("").length,
            remaining = window.spacescout_reviews.review_char_limit - text.length + not_counted,
            span = $('#space-review-remaining');

        $(this).attr("maxlength", window.spacescout_reviews.review_char_limit + not_counted);

        if (remaining > 0) {
            span.html(remaining);
            span.removeClass('required');
        } else {
            span.html(0);
            span.addClass('required');
        }
        var x = $('input[name=star-rating]:checked');

        if (text.trim().length > 0 && $('input[name=star-rating]:checked').length) {
            enableSubmitButton();
        } else {
            disableSubmitButton();
        }
    });

    $('button#space-review-cancel').click(function (e) {
        $('.space-review-compose').hide(400);
        if ($('.space-reviews-none').length) {
            $('.space-reviews-none').show();
        } else {
            showRatingEditorButton();
        }

        tidyUpRatesComposer();
    });

    $('button#space-review-submit').click(function (e) {
        var id = $(e.target).closest('div[id^=detail_container_]').attr('id').match(/_(\d+)$/)[1],
            rb_id = $('input[name=star-rating]:checked').prop('id'),
            review = {
                review: $('.space-review-compose textarea').val().trim()
            };

        debugger
        if (review_rating_values.hasOwnProperty(rb_id)) {
            review.rating = review_rating_values[rb_id].val;
        } else {
            return;
        }

        // defer until authenticated
        if (window.spacescout_authenticated_user.length == 0) {
            $.cookie('space_review', JSON.stringify({ id: id, review: review }));
            window.location.href = '/login?next=' + window.location.pathname;
        }

        postRatingAndReview(id, review);
    });

    $('.space-review-submitted a').click(function (e) {
        $('.space-review-submitted').hide(400);

        if ($('.space-reviews-none').length) {
            $('.space-reviews-none').show();
        } else {
            showRatingEditorButton();
        }
    });

    $(document).on('click', 'a.rating-star', function (e) {
        var target = $(e.currentTarget),
            rb_id = target.prop('id').match(/^([a-z]+-star)-link$/)[1];

        $('#' + rb_id).prop('checked', true);
        target.parent().prevAll('.space-review-stars').find('i').switchClass('fa-star-o', 'fa-star');
        target.find('i').switchClass('fa-star-o', 'fa-star');
        target.parent().nextAll('.space-review-stars').find('i').switchClass('fa-star', 'fa-star-o');
        $('.space-review-compose .space-review-rating span').html(review_rating_values[rb_id].key);
        if ($('.space-review-compose textarea').val().length) {
            enableSubmitButton();
        }
    });

    $('#review_guidelines').on('click', function () {
        if ($(this).next().is(':visible')) {
            hideReviewGuidelines();
        } else {
            showReviewGuidelines();
        }
    });

    $(document).on('loadSpaceReviews', function (e, id) {
        var review = $.cookie('space_review');

        if (review && window.spacescout_authenticated_user.length > 0) {
            var json_review = review ? JSON.parse(review) : null;

            if (json_review && !json_review.invalid && id == json_review.id) {
                postRatingAndReview(json_review.id, json_review.review);
                $('.space-reviews-none').hide();
            }

            $.cookie('space_review', JSON.stringify({ invalid: true, id: 0, review: '' }));
            $.removeCookie('space_review');
        }

        $('#show_reviews').click(function (e) {
            var node, top;

            if (isMobile) {
                node = $('html, body');
                top = $('.space-ratings-and-reviews').offset().top
                                       + $('.space-detail-body').scrollTop();
            } else {
                node = $('.space-detail-body');
                top = $('.space-ratings-and-reviews').offset().top
                                       + $('.space-detail-body').scrollTop()
                                       - $('.space-detail-body').offset().top;
            }

            e.preventDefault();
            node.animate({ scrollTop: top }, '500');
        });
    });
}


function loadRatingsAndReviews(id, review_container, rating_container) {
    $.ajax({
        url: '/web_api/v1/space/' + id + '/reviews',
        success: function (data) {
            var template = Handlebars.compile($('#space_reviews_review').html()),
                rating_sum = 0,
                total_reviews = (data && data.length) ? data.length : 0,
                html_count = Handlebars.compile($('#space_reviews_count').html())({ count : total_reviews }),
                node;

            review_container.html('');

            $('span#review_count', rating_container).html(html_count);

            if (total_reviews > 0) {

                data.sort(function (a, b) {
                    return new Date(b.date_submitted) - new Date(a.date_submitted);
                });

                $.each(data, function(i) {
                    var review = this,
                        rating = this.rating,
                        date = new Date(this.date_submitted),
                        verbiage = [
                            'Rated as a ' + gettext('one') + ' star, ' + gettext('terrible'),
                            'Rated as a ' + gettext('two') + ' star, ' + gettext('poor'),
                            'Rated as a ' + gettext('three') + ' star, ' + gettext('average'),
                            'Rated as a ' + gettext('four') + ' star, ' + gettext('good'),
                            'Rated as a ' + gettext('five') + ' star, ' + gettext('excellent')
                        ];                            

                    node = $(template({
                        reviewer: this.reviewer,
                        verbiage: verbiage[rating - 1],
                        review: (this.review && this.review.length) ? this.review : 'No review provided',
                        date: date ? monthname_from_month(date.getMonth()) + ' ' + date.getDate() + ', ' + date.getFullYear() : ''
                    }));

                    rating_sum += parseInt(this.rating);

                    $('.space-review-header i', node).each(function(i) {
                        if (i < rating) {
                            $(this).switchClass('fa-star-o', 'fa-star');
                        }
                    });

                    if (i >= window.spacescout_reviews.pagination) {
                        node.hide();
                    }

                    review_container.append(node);
                });

                if (data.length > window.spacescout_reviews.pagination) {
                    node = Handlebars.compile($('#more_space_reviews').html())();
                    review_container.append(node);

                    $('.more-space-reviews a').on('click', function (e) {
                        $('.space-reviews-review:hidden').each(function (i) {
                            if (i < window.spacescout_reviews.pagination) {
                                $(this).slideDown(400);
                            }
                        });

                        if ($('.space-reviews-review:hidden').length <= 0) {
                            $(this).parent().hide();
                        }
                    });
                }

                if (rating_sum) {
                    var avg = rating_sum / data.length,
                        dec = Math.floor(avg),
                        frac = avg % 1;

                    $('i', rating_container).each(function(i) {
                        if (i < dec) {
                            $(this).switchClass('fa-star-o', 'fa-star');
                        } else if (i == dec && frac > 0) {
                            if (frac > 0.5) {
                                $(this).switchClass('fa-star-o', 'fa-star');
                            } else {
                                $(this).switchClass('fa-star-o', 'fa-star-half-o');
                            }
                        }
                    });
                }

                $('.write-a-review').attr('title', gettext('write_review_for')
                                          + $('#space-detail-name span:last-child').text());
                showRatingEditorButton();
            } else if ($('.space-review-compose').length) {
                hideRatingEditorButton();
                review_container.html(Handlebars.compile($('#no_space_reviews').html())());
                $('.write-a-review', review_container).on('click', function (e) {
                    showRatingEditor();
                });
            } else {
                review_container.remove();
            }

            $.event.trigger('loadSpaceReviews', [ id ]);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log('Unable to load reviews: ' + xhr.responseText);
        }
    });
}


function postRatingAndReview(id, review) {
    $.ajax({
        url: '/web_api/v1/space/' + id + '/reviews',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(review),
        type: "POST",
        success: function (data) {
            tidyUpRatesComposer();
            $('.space-review-compose').hide(400);
            $('.space-review-submitted').show(400);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log('Unable to post reviews: ' + xhr.responseText);
        }
    });
}


function showRatingEditor () {
    disableSubmitButton();
    hideRatingEditorButton();
    $('#space-review-remaining').html(window.spacescout_reviews.review_char_limit);
    $('.space-reviews-none').hide(400);
    $('.space-review-compose').show(400, function(){
        var w_node = $('.space-detail-body'),
            w_top = w_node.scrollTop(),
            w_height = w_node.height(),
            t_node = $(this),
            t_top = t_node.offset().top - w_node.offset().top,
            t_height = t_node.height(),
            diff = Math.ceil((t_top + t_height) - (w_top + w_height)),
            padding = 20;

        if (diff > 0) {
            w_node.animate( {scrollTop: (diff + w_top + padding)}, '500');
        }

        $('#one-star-link').focus();
    });
}


function tidyUpRatesComposer () {
    var node = $('.space-review-compose');

    disableSubmitButton();
    hideReviewGuidelines();
    $('input[name=star-rating]:checked').prop('checked', false);
    $('textarea', node).val('');
    $('.space-review-rating span', node).html('');
    $('#space-review-remaining').html(window.spacescout_reviews.review_char_limit);
    $('#space-review-remaining').removeClass('required');
    $('.space-review-rating div + div span', node).removeClass('required');
    $('a.rating-star i', node).switchClass('fa-star', 'fa-star-o');
}

function showRatingEditorButton () {
    $('.space-ratings-and-reviews .write-a-review.add-a-review').show();
}

function hideRatingEditorButton () {
    $('.space-ratings-and-reviews .write-a-review.add-a-review').hide();
}


function enableSubmitButton () {
    $('button#space-review-submit').removeAttr('disabled');
}


function disableSubmitButton () {
    $('button#space-review-submit').attr('disabled', 'disabled');
}


function showReviewGuidelines () {
    var ul = $('.space-review-compose ul');

    ul.show();
    ul.prev().find('i').switchClass('fa-angle-double-down', 'fa-angle-double-up');
}


function hideReviewGuidelines () {
    var ul = $('.space-review-compose ul');

    ul.hide();
    ul.prev().find('i').switchClass('fa-angle-double-up', 'fa-angle-double-down');
};
