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
from django.http import HttpResponseNotFound
from django.template import loader
from django.template.loader import render_to_string

@mobile_template('spacescout_web/{mobile/}404.html')
def page_not_found(request, template=None):

    template_list = (
        template,
        '404.html'
    )

    if(request.META['PATH_INFO'] == '/space-not-found'):
        params = {
            'message' : 'Sorry! Unable to load detailes for this space',
        }
    else:
        params = {
            'message' : 'Sorry! Scout couldn\'t fetch the page at ',
            'request_path': request.META['PATH_INFO'],
            }

    return HttpResponseNotFound(loader.render_to_string(template, params, context_instance=RequestContext(request)))
