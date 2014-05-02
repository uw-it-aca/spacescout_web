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
from django.http import HttpResponse, HttpResponseRedirect
from mobility.decorators import mobile_template
from django.views.decorators.cache import never_cache
import simplejson as json
import time
import oauth2

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
from django.utils.translation import ugettext as _
import oauth2
import simplejson as json
import re
from django.http import Http404

from django.http import HttpResponse


def xFavoritesView(request, return_json=False):
    # Required settings for the client
    if not hasattr(settings, 'SS_WEB_SERVER_HOST'):
        raise(Exception("Required setting missing: SS_WEB_SERVER_HOST"))
    if not hasattr(settings, 'SS_WEB_OAUTH_KEY'):
        raise(Exception("Required setting missing: SS_WEB_OAUTH_KEY"))
    if not hasattr(settings, 'SS_WEB_OAUTH_SECRET'):
        raise(Exception("Required setting missing: SS_WEB_OAUTH_SECRET"))

    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)

    url = "{0}/api/v1/user/me/favorites".format(settings.SS_WEB_SERVER_HOST)

    headers = {
        "XOAUTH_USER": "%s" % request.user.username,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

    resp, content = client.request(url, 'GET', headers=headers)
    if resp.status == 404:
        url = request.get_host()
        url = url + "/contact"
        raise Http404
    elif resp.status != 200:
        response = HttpResponse("Error loading spot")
        response.status_code = resp.status_code
        return response

    params = json.loads(content)

    # clean up spots
    for fav in params:
        fav['type'] = ','.join([_(x) for x in fav['type']])
        modified_date = '-'.join([fav["last_modified"][5:10], fav["last_modified"][:4]])
        fav["last_modified"] = re.sub('-', '/', modified_date)
        fav["available_hours"] = json.dumps(fav['available_hours'])
        code = re.match(r'.*\(([A-Z]+)\)$', fav["location"]["building_name"])
        fav["location"]["building_code"] = code.group(1) if code else fav["location"]["building_name"]

    if return_json:
        return HttpResponse(content, mimetype='application/json')
    else:
        return render_to_response('favorites.html',
                                  {
                                       'total' : len(params),
                                       'favorites' : params
                                   },
                                  context_instance=RequestContext(request))


# User's favorite spaces
@mobile_template('{mobile/}favorites.html')
def FavoritesView(request, template=None):

    if not request.user.is_authenticated():
        return HttpResponseRedirect('login?next=favorites')

    params = {
        'locations': settings.SS_LOCATIONS
    }

    return render_to_response(template, params, context_instance=RequestContext(request))


# Shim to fetch server-side user favorites
@never_cache
def API(request, spot_id=None):
    
    if not request.user.is_authenticated():
        return HttpResponse('Unauthorized', status=401)

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

