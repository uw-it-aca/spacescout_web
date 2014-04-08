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
import oauth2
from django.utils.translation import ugettext as _
import simplejson as json
import re


class SpotException(Exception):
    def __init__(self, resp):
        self.resp = resp


class Spot(object):
    def __init__(self, spot_id):
        self.spot_id = spot_id

    def get(self):
        # Required settings for the client
        if not hasattr(settings, 'SS_WEB_SERVER_HOST'):
            raise(Exception("Required setting missing: SS_WEB_SERVER_HOST"))
        if not hasattr(settings, 'SS_WEB_OAUTH_KEY'):
            raise(Exception("Required setting missing: SS_WEB_OAUTH_KEY"))
        if not hasattr(settings, 'SS_WEB_OAUTH_SECRET'):
            raise(Exception("Required setting missing: SS_WEB_OAUTH_SECRET"))

        consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
        client = oauth2.Client(consumer)

        url = "{0}/api/v1/spot/{1}".format(settings.SS_WEB_SERVER_HOST, self.spot_id)

        resp, content = client.request(url, 'GET')

        if resp.status != 200:
            raise SpotException(resp)

        spot = json.loads(content)

        types = []
        for t in spot["type"]:
            types.append(_(t))

        spot["type"] = ','.join(types)
        modified_date = spot["last_modified"][5:10] + '-' + spot["last_modified"][:4]
        spot["last_modified"] = re.sub('-', '/', modified_date)

        return spot
