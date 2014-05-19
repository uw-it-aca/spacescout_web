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
from django.views.decorators.cache import never_cache
from spacescout_web.views.rest_dispatch import RESTDispatch, RESTException, JSONResponse
import oauth2


class ReviewsView(RESTDispatch):
    def __init__(self):
        consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
        self._client = oauth2.Client(consumer)

    def _url(self, spot_id):
        return "{0}/api/v1/spot/{1}/reviews".format(settings.SS_WEB_SERVER_HOST, spot_id)

    def POST(self, request, spot_id):
        if not (request.user and request.user.is_authenticated()):
            response = HttpResponse("User not authorized")
            response.status_code = 401
            return response

        headers = {
            "XOAUTH_USER": "%s" % request.user.username,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

        resp, content = self._client.request(self._url(spot_id),
                                             method='POST',
                                             body=request.body,
                                             headers=headers)

        if not (resp.status == 200 or resp.status == 201):
            return HttpResponse('error', status=resp.status)

        return HttpResponse("{}", mimetype='application/json', status=resp.status)

    @never_cache
    def GET(self, request, spot_id):

        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            }

        response_body = '{}'

        resp, content = self._client.request(self._url(spot_id), method='GET', headers=headers)

        if resp.status == 200 or resp.status == 201:
            response_body = content if content else '{}'
        else:
            return HttpResponse('error', status=resp.status)

        return HttpResponse(response_body, mimetype='application/json', status=200)
