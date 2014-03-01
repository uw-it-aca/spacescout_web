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
from django.http import HttpResponseRedirect
from mobility.decorators import mobile_template


# User's favorite spaces
@mobile_template('{mobile/}favorites.html')
def Favorites(request, template=None):

    if not request.user.is_authenticated():
        return HttpResponseRedirect('login?next=favorites')

    params = {
        'locations': settings.SS_LOCATIONS
    }

    return render_to_response(template, params, context_instance=RequestContext(request))