/*
    Copyright 2013 Board of Trustees, University of Illinois

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

    Description
    =================================================================
    Customizations for UIUC searches.
*/

// $ = jQuery
(function ($) {
    
    /* Populate the filter box with saved search options. */
    $(document).on( 'search_afterRepopulateFilters', function (event, filter_opts) {
        if (!filter_opts.only_at && !filter_opts.open_until && !filter_opts.open_now)
            $('#open_anytime').prop( 'checked', true );
    } );

    /* Save the filter box options into the search options. */
    $(document).on( 'search_afterRunCustomOptions', function (event, filter_opts, results) {
        if ($('#open_anytime').prop( 'checked' )) {
            filter_opts.open_anytime = 1;
            results.set_cooke = true;
        }
    } );

    /* Fixup the args before we send it to the backend. */
    $(document).on( 'search_afterFetchDataArgs', function (event, args) {
        if (!args.open_at && !args.open_anytime)
            args.open_now = 1;
        else
            delete args.open_now;
    } );

})(jQuery);
