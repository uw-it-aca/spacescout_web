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
from django.http import HttpResponse
from django.conf import settings
from django.utils.translation import ugettext as _
import urllib
import oauth2
import types
import simplejson
import sys


def SearchView(request):

    # Required settings for the client

    if not hasattr(settings, 'SS_WEB_SERVER_HOST'):
        raise(Exception("Required setting missing: SS_WEB_SERVER_HOST"))
    if not hasattr(settings, 'SS_WEB_OAUTH_KEY'):
        raise(Exception("Required setting missing: SS_WEB_OAUTH_KEY"))
    if not hasattr(settings, 'SS_WEB_OAUTH_SECRET'):
        raise(Exception("Required setting missing: SS_WEB_OAUTH_SECRET"))

    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)

    search_args = {}

    for key in request.GET:
        search_args[key] = request.GET.getlist(key)

    if 'shibboleth' in sys.modules and request.user.is_authenticated():
        search_args["org_filter:eppn"] = request.user.username

    json = get_space_search_json(client, search_args)
    json = simplejson.loads(json)
    i18n_json = []
    for space in json:
        string_val = ''
        for x in range(0, len(space['type'])):
            if x is 0:
                string_val = _(space['type'][x])
            else:
                string_val = string_val + ', ' + _(space['type'][x])
        space['type'] = string_val
        i18n_json.append(space)
    json = simplejson.dumps(i18n_json)
    response = HttpResponse(json)

    response["Content-type"] = "application/json"

    return response


def get_space_search_json(client, options):
    args = []
    for key in options:
        if isinstance(options[key], types.ListType):
            for item in options[key]:
                args.append("{0}={1}".format(urllib.quote(key), urllib.quote(item)))
        else:
            args.append("{0}={1}".format(urllib.quote(key), urllib.quote(options[key])))

    url = "{0}/api/v1/spot/?{1}".format(settings.SS_WEB_SERVER_HOST, "&".join(args))

    resp, content = client.request(url, 'GET')

    if resp.status == 200:
        return content

    return '[]'
