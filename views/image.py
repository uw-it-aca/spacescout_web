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
import urllib
import oauth2
import types


def ImageView(request, spot_id, image_id, thumb_width=None, thumb_height=None, constrain=False):

    # Required settings for the client

    if not hasattr(settings, 'SS_WEB_SERVER_HOST'):
        raise(Exception("Required setting missing: SS_WEB_SERVER_HOST"))
    if not hasattr(settings, 'SS_WEB_OAUTH_KEY'):
        raise(Exception("Required setting missing: SS_WEB_OAUTH_KEY"))
    if not hasattr(settings, 'SS_WEB_OAUTH_SECRET'):
        raise(Exception("Required setting missing: SS_WEB_OAUTH_SECRET"))

    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)

    contenttype, img = get_image(client, spot_id, image_id, constrain, thumb_width, thumb_height)

    response = HttpResponse(img)

    response["Content-type"] = contenttype

    return response


def get_image(client, spot_id, image_id, constrain, thumb_width=None, thumb_height=None):
    if constrain is True:
        constraint = []
        if thumb_width:
            constraint.append("width:%s" % thumb_width)
        if thumb_height:
            constraint.append("height:%s" % thumb_height)
        url = "{0}/api/v1/spot/{1}/image/{2}/thumb/constrain/{3}".format(settings.SS_WEB_SERVER_HOST, spot_id, image_id, ','.join(constraint))
    else:
        url = "{0}/api/v1/spot/{1}/image/{2}/thumb/{3}x{4}".format(settings.SS_WEB_SERVER_HOST, spot_id, image_id, thumb_width, thumb_height)

    resp, content = client.request(url, 'GET')

    if resp.status == 200:
        return resp['content-type'], content

    return '[]'
