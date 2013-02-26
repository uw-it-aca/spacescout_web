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
from django.conf import settings
from django.http import HttpResponse
import oauth2
import simplejson as json


def buildings(request):
    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)

    query = None
    if request.GET:
        for key, value in request.GET.items():
            query = "%s=%s" % (key, value)
    building_list = get_building_json(client, query)

    return HttpResponse(building_list, mimetype='application/json')


def get_building_json(client, query=None):
    url = "{0}/api/v1/buildings".format(settings.SS_WEB_SERVER_HOST)
    if query:
        url = url + "?" + query
    resp, content = client.request(url, 'GET')

    if resp.status == 200:
        return content

    return '[]'
