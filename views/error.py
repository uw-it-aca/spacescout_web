""" Copyright 2012, 2013 UW Information Technology, University of Washington

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
"""
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.conf import settings
from mobility.decorators import mobile_template


@mobile_template('{mobile/}404.html')
def page_not_found(request, template=None):

    # See if there is a Google Analytics web property id
    try:
        ga_tracking_id = settings.GA_TRACKING_ID
    except:
        ga_tracking_id = None

    params = {
        'request_path': request.META['PATH_INFO'],
        'ga_tracking_id': ga_tracking_id,
    }
    return render_to_response(template, params, context_instance=RequestContext(request))
