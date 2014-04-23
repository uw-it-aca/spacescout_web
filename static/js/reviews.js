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

window.spacescout_reviews = { review_char_limit: 300 };

function setupRatingsAndReviews() {

    var enable_submit = function () {
            $('button#space-review-submit').removeAttr('disabled');
        },
        disable_submit = function () {
            $('button#space-review-submit').attr('disabled', 'disabled');
        };
        
    // wire up events for markup in reviews.html
    $('.space-reviews .write-a-review').on('click', function (e) {
        $('.space-reviews button.write-a-review').hide();
        $('.space-review-compose').show(400);
        $('.space-reviews-none').hide(400);
        $('#space-review-remaining').html(window.spacescout_reviews.review_char_limit);
    });

    disable_submit();

    $('.space-review-compose textarea').keyup(function (e) {
        var l = $(this).val().length,
            remaining = window.spacescout_reviews.review_char_limit - l,
            span = $('.space-review-rating div + div span');

        if (remaining > 0) {
            span.html(remaining);
            span.removeClass('required');
        } else {
            span.html(0);
            span.addClass('required');
        }

        if (l > 0 && $('.space-review-compose .space-review-stars i.fa-star').length) {
            enable_submit();
        } else {
            disable_submit();
        }
    });

    $('button#space-review-cancel').click(function (e) {
        var node = $('.space-review-compose');

        node.hide(400);
        $('.space-reviews-none').show();
        $('.space-reviews button.write-a-review').show();

        disable_submit();
        $('textarea', node).val('');
        $('.space-review-stars span + span', node).html('');
        $('#space-review-remaining').html(window.spacescout_reviews.review_char_limit);
        $('.space-review-rating div + div span', node).removeClass('required');
        $('.space-review-rating i', node).switchClass('fa-star', 'fa-star-o');
    });

    $('button#space-review-submit').click(function (e) {
        var id = $(e.target).closest('div[id^=detail_container_]').attr('id').match(/_(\d+)$/)[1];

        submitRatingAndReview(id);
    });

    $('.space-review-submitted a').click(function (e) {
        $('.space-review-submitted').hide(400);
        $('.space-reviews-none').show();
        $('.space-reviews button.write-a-review').show();
    });

    $(document).on('click', '.space-review-stars i', function (e) {
        var target = $(e.target),
            stars = target.prevAll('i'),
            rating = stars.length + 1,
            ratings = ['', gettext('terrible'), gettext('poor'),
                       gettext('average'), gettext('good'), gettext('excellent')];

        stars.switchClass('fa-star-o', 'fa-star');
        target.switchClass('fa-star-o', 'fa-star');
        target.nextAll('i').switchClass('fa-star', 'fa-star-o');
        $('.space-review-stars span:last-child').html(ratings[rating]);
        if ($('.space-review-compose textarea').val().length) {
            enable_submit();
        }
    });

    $('.space-review-compose a').on('click', function (e) {
        var target = $(e.target),
            ul = target.next('ul');

        if (ul.is(':visible')) {
            target.find('i').switchClass('fa-angle-double-up', 'fa-angle-double-down');
        } else {
            target.find('i').switchClass('fa-angle-double-down', 'fa-angle-double-up');
        }

        ul.toggle(400);
    });
}


function loadRatingsAndReviews(id) {
    $.ajax({
        url: 'web_api/v1/space/' + id + '/reviews',
        success: function (data) {
            var template = Handlebars.compile($('#space_reviews').html()),
                content = $('.space-reviews-content'),
                rating_sum = 0;

            content.html('');

            if (data && data.length > 0) {
                $.each(data, function() {
                    var review = this,
                        rating = this.rating,
                        date = new Date(this.date_submitted),
                        node = $(template({
                            reviewer: this.reviewer,
                            review: (this.review && this.review.length) ? this.review : 'No review provided',
                            date: date ? monthname_from_month(date.getMonth()) + ' ' + date.getDate() + ', ' + date.getFullYear() : ''
                        }));

                    rating_sum += parseInt(this.rating);

                    $('.space-review-header i', node).each(function(i) {
                        if (i < rating) {
                            $(this).switchClass('fa-star-o', 'fa-star');
                        }
                    });

                    content.append(node);
                });

                if (rating_sum) {
                    var avg = Math.ceil((rating_sum) / data.length);

                    $('.space-actions i').each(function(i) {
                        if (i < avg) {
                            $(this).switchClass('fa-star-o', 'fa-star');
                        }
                    });

                    $('.space-actions span#review_count').html(data.length);
                }

            } else {
                template = Handlebars.compile($('#no_space_reviews').html());
                content.html(template());
                $('.write-a-review', content).on('click', function (e) {
                    $('.space-reviews button.write-a-review').hide();
                    $('.space-review-compose').show(400);
                    $('.space-reviews-none').hide(400);
                    $('#space-review-remaining').html(window.spacescout_reviews.review_char_limit);
                });
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log('Unable to load reviews: ' + xhr.responseText);
        }
    });
}

function submitRatingAndReview(id) {
    var node = $('.space-review-compose'),
        review = {
            rating: $('.space-review-rating i.fa-star', node).length,
            review: $('textarea', node).val().trim()
        };

    //validate
    if (review.rating < 1 || review.rating > 5 || review.review.length <= 0) {
        return;
    }

    $.ajax({
        url: 'web_api/v1/space/' + id + '/reviews',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(review),
        type: "POST",
        success: function (data) {
            $('.space-reviews button.write-a-review').hide();
            $('.space-review-compose').hide(400);
            $('.space-review-submitted').show();
        },
        error: function (xhr, textStatus, errorThrown) {
            debugger
            console.log('Unable to post reviews: ' + xhr.responseText);
        }
    });
}

