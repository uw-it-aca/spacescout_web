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
from django.http import HttpResponse
from mobility.decorators import mobile_template
from django.views.decorators.cache import never_cache
from django.contrib.auth.decorators import login_required
from spacescout_web.views.contact import validate_back_link
import oauth2


# User's favorite spaces
@login_required(login_url='/login')
@mobile_template('spacescout_web/{mobile/}favorites.html')
def FavoritesView(request, template=None):
    try:
        back = request.GET['back']
        validate_back_link(back)
    except:
        back = '/'

    return render_to_response(template,
                              {
                                  'locations': settings.SS_LOCATIONS,
                                  'back': back
                              },
                              context_instance=RequestContext(request))


# Shim to fetch server-side user favorites
@login_required(login_url='/login')
@never_cache
def API(request, spot_id=None):
    
    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)

    if request.META['REQUEST_METHOD'] == 'GET':
        if spot_id:
            url = "{0}/api/v1/user/me/favorite/{1}".format(settings.SS_WEB_SERVER_HOST, spot_id)
        else:
            url = "{0}/api/v1/user/me/favorites".format(settings.SS_WEB_SERVER_HOST)

        method = 'GET'
        body = ''

    elif request.META['REQUEST_METHOD'] == 'PUT':

        url = "{0}/api/v1/user/me/favorite/{1}".format(settings.SS_WEB_SERVER_HOST, spot_id)
        method = 'PUT'
        body = request.read()

    elif request.META['REQUEST_METHOD'] == 'DELETE':

        url = "{0}/api/v1/user/me/favorite/{1}".format(settings.SS_WEB_SERVER_HOST, spot_id)
        method = 'DELETE'
        body=''

    else:
        return HttpResponse('Method not allowed', status=405)

    headers = {
        "XOAUTH_USER": "%s" % request.user.username,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

    response_body = {}

    resp, content = client.request(url,
                                   method=method,
                                   body=body,
                                   headers=headers)

    if resp.status == 200 or resp.status == 201:
        response_body = content if content else '{}'
    else:
        return HttpResponse('error', status=resp.status)

    return HttpResponse(response_body, mimetype='application/json', status=200)

