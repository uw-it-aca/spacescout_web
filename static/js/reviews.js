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
            review = {
                review: $('.space-review-compose textarea').val().trim(),
                rating: parseInt($('input[name=star-rating]:checked').val())
            };

        if (!review.rating) {
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

    $("input[name=star-rating]").change(function (e) {
        var target = $(e.target),
            rating = parseInt(target.val()),
            rating_names = [
                gettext('terrible'),
                gettext('poor'),
                gettext('average'),
                gettext('good'),
                gettext('excellent')
            ];
        
        target.closest('ol').find('li input').each(function () {
            var t = $(this);

            if (t.val() > rating) {
                t.next().find('i').switchClass('fa-star', 'fa-star-o');
            } else {
                t.next().find('i').switchClass('fa-star-o', 'fa-star');
            }
        });

        $('.space-review-compose .space-review-rating span').html(rating_names[rating - 1]);
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
                node,
                rating_descriptions = [
                    Handlebars.compile($('#rating_description_one_star').html())({}),
                    Handlebars.compile($('#rating_description_two_star').html())({}),
                    Handlebars.compile($('#rating_description_three_star').html())({}),
                    Handlebars.compile($('#rating_description_four_star').html())({}),
                    Handlebars.compile($('#rating_description_five_star').html())({})
                ];

            review_container.html('');

            $('span#review_count', rating_container).html(html_count);

            if (total_reviews > 0) {

                data.sort(function (a, b) {
                    return new Date(b.date_submitted) - new Date(a.date_submitted);
                });

                $.each(data, function(i) {
                    var review = this,
                        rating = this.rating,
                        date = new Date(this.date_submitted);

                    node = $(template({
                        reviewer: this.reviewer,
                        rating_description: rating_descriptions[rating - 1],
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
                        var container = $(this).closest('.space-ratings-and-reviews'),
                            hidden = $('.space-reviews-review:hidden', container);

                        hidden.each(function (i) {
                            if (i < window.spacescout_reviews.pagination) {
                                $(this).slideDown(400);
                            }
                        });

                        if (hidden.length <= window.spacescout_reviews.pagination) {
                            $(this).parent().hide();
                        }
                    });
                }

                if (rating_sum) {
                    var avg = rating_sum / data.length,
                        dec = Math.floor(avg),
                        frac = Math.floor((avg % 1)*10),
                        frac_string,
                        number = ['', gettext('one'), gettext('two'),
                                  gettext('three'), gettext('four'), gettext('five')],
                        rating_template = Handlebars.compile($('#space_average_rating').html());

                    $('i', rating_container).each(function(i) {
                        if (i < dec) {
                            $(this).switchClass('fa-star-o', 'fa-star');
                        } else if (i == dec && frac > 0) {
                            if (frac > 5) {
                                $(this).switchClass('fa-star-o', 'fa-star');
                            } else {
                                $(this).switchClass('fa-star-o', 'fa-star-half-o');
                            }
                        }
                    });

                    $('#space-average-rating-text', rating_container).html(rating_template({
                        total: data.length,
                        total_plural: (data.length > 1) ? 's' : '',
                        decimal: number[dec],
                        fraction: (frac > 5) ? '' : gettext(' and one half'),
                        star_plural: (dec > 1 || frac <= 5) ? 's' : ''
                    }));
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
    $('input[name=star-rating]').next().find('i').switchClass('fa-star', 'fa-star-o');
    $('textarea', node).val('');
    $('.space-review-rating span', node).html('');
    $('#space-review-remaining').html(window.spacescout_reviews.review_char_limit);
    $('#space-review-remaining').removeClass('required');
    $('.space-review-rating div + div span', node).removeClass('required');
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
    var link = $('#review_guidelines');

    link.next().show();
    link.attr('title', 'Click to hide review guidelines');
    $('i', link).switchClass('fa-angle-double-down', 'fa-angle-double-up');

}


function hideReviewGuidelines () {
    var link = $('#review_guidelines');

    link.next().hide();
    link.attr('title', 'Click to see review guidelines');
    $('i', link).switchClass('fa-angle-double-up', 'fa-angle-double-down');
};
