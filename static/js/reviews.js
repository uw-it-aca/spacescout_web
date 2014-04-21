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


function setupRatingsAndReviews() {

    var REVIEW_CHAR_LIMIT = 300;


    // wire up events for markup in reviews.html
    $('.space-reviews .write-a-review').on('click', function (e) {
        $('.space-reviews button.write-a-review').hide();
        $('.space-review-compose').show(400);
        $('.space-reviews-none').hide(400);
        $('.space-review-rating div b span').html(REVIEW_CHAR_LIMIT);
    });

    $('.space-review-compose textarea').keyup(function (e) {
        var remaining = REVIEW_CHAR_LIMIT - $(this).val().length;

        if (remaining > 0) {
            $('.space-review-rating div b span').html(remaining);
        } else {
            $('.space-review-rating div b span').html(0);
        }
    });

    $('button#space-review-cancel').click(function (e) {
        var node = $('.space-review-compose');

        node.hide(400);
        $('.space-reviews-none').show();
        $('.space-reviews button.write-a-review').show();

        $('textarea', node).val('');
        $('.space-review-stars span', node).html('');
        $('.space-review-rating div b span', node).html(REVIEW_CHAR_LIMIT);
        $('.space-review-rating i', node).switchClass('fa-star', 'fa-star-o');
    });

    $('button#space-review-submit').click(function (e) {
        $('.space-reviews button.write-a-review').hide();
        $('.space-review-compose').hide(400);
        $('.space-review-submitted').show();
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
        $('.space-review-stars span').html(ratings[rating]);
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
