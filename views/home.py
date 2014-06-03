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
import oauth2
import simplejson as json
import hashlib
import urllib
from django.utils.datastructures import SortedDict
from mobility.decorators import mobile_template
from django.core.exceptions import ImproperlyConfigured
from django.core.cache import cache
from django.utils.translation import ugettext as _
import types
import re

FIVE_MINUTE_CACHE = 300

@mobile_template('spacescout_web/{mobile/}app.html')
def HomeView(request, template=None):
    # The preference order is cookie, config, then some static values
    # That fallback order will also apply if the cookie campus isn't in
    # settings.
    location = None

    if hasattr(settings, "SS_LOCATIONS"):
        m = re.match(r'^/([a-z]+)/', request.path)
        if m and m.group(1) in settings.SS_LOCATIONS:
            location = m.group(1)

    if location is None:
        cookies = request.COOKIES
        if "default_location" in cookies:
            cookie_value = cookies["default_location"]
            # The format of the cookie is this, urlencoded:
            # lat,long,campus,zoom
            location = urllib.unquote(cookie_value).split(',')[2]
    
            if not hasattr(settings, "SS_LOCATIONS"):
                location = None

            elif not location in settings.SS_LOCATIONS:
                location = None

    if location is None:
        if hasattr(settings, 'SS_DEFAULT_LOCATION'):
            location = settings.SS_DEFAULT_LOCATION

    spaces, template_values = get_campus_data(location)

    spaces = json.dumps(spaces)

    # Default to zooming in on the UW Seattle campus if no default location is set
    if hasattr(settings, 'SS_DEFAULT_LOCATION'):
        default_location = settings.SS_DEFAULT_LOCATION
        locations = settings.SS_LOCATIONS

    if (hasattr(settings, 'SS_BUILDING_CLUSTERING_ZOOM_LEVELS') and hasattr(settings, 'SS_DISTANCE_CLUSTERING_RATIO')):
        by_building_zooms = settings.SS_BUILDING_CLUSTERING_ZOOM_LEVELS
        by_distance_ratio = settings.SS_DISTANCE_CLUSTERING_RATIO
    else:
        raise ImproperlyConfigured("You need to configure your clustering constants in settings.py or local_settings.py")

    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        }

    if request.user and request.user.is_authenticated():
        headers["XOAUTH_USER"] = "%s" % request.user.username

    log_shared_space_reference(request, headers, client)

    buildings = json.loads(get_building_json(client))

    favorites_json = get_favorites_json(headers, client)

    # This could probably be a template tag, but didn't seem worth it for one-time use
    #TODO: hey, actually it's probably going to be a Handlebars helper and template
    buildingdict = SortedDict()
    for building in buildings:
        try:
            if not building[0] in buildingdict.keys():  # building[0] is the first letter of the string
                buildingdict[building[0]] = []

            buildingdict[building[0]].append(building)
        except:
            pass

    params = {
        'username' : request.user.username if request.user and request.user.is_authenticated() else '',
        'center_latitude': template_values['center_latitude'],
        'center_longitude': template_values['center_longitude'],
        'zoom_level': template_values['zoom_level'],
        'locations': locations,
        'default_location': default_location,
        'by_building_zooms': by_building_zooms,
        'by_distance_ratio': by_distance_ratio,
        'buildingdict': buildingdict,
        'spaces': spaces,
        'favorites_json': favorites_json,
    }

    response = render_to_response(template, params, context_instance=RequestContext(request))
    response['Cache-Control'] = 'no-cache'
    return response


def get_key_for_search_args(search_args):
    query = []
    for key, value in search_args.items():
        query.append("%s=%s" % (key, value))

    joined = "&".join(query)

    return "space_search_%s" % hashlib.sha224(joined).hexdigest()

def get_campus_data(campus):
    spaces = fetch_open_now_for_campus(campus)
    template_values = template_values_for_campus(campus)

    return spaces, template_values

def template_values_for_campus(campus):
    if campus is None:
        return {
            # Default to zooming in on the UW Seattle campus
            'center_latitude': '47.655003',
            'center_longitude': '-122.306864',
            'zoom_level': '15',
        }

    location = settings.SS_LOCATIONS[campus]
    return {
        'center_latitude': location['CENTER_LATITUDE'],
        'center_longitude': location['CENTER_LONGITUDE'],
        'zoom_level': location['ZOOM_LEVEL'],
    }

def fetch_open_now_for_campus(campus, use_cache=True, fill_cache=False, cache_period=FIVE_MINUTE_CACHE):
    if campus is None:
        # Default to zooming in on the UW Seattle campus
        center_latitude = '47.655003'
        center_longitude = '-122.306864'
        zoom_level = '15'
        distance = '500'

    else:
        location = settings.SS_LOCATIONS[campus]
        center_latitude = location['CENTER_LATITUDE']
        center_longitude = location['CENTER_LONGITUDE']
        zoom_level = location['ZOOM_LEVEL']

        if 'DISTANCE' in location:
            distance = location['DISTANCE']
        else:
            distance = '500'

    # SPOT-1832.  Making the distance far enough that center of campus to furthest spot from the center
    # can be found
    distance = 1000
    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)

    search_args = {
        'center_latitude': center_latitude,
        'center_longitude': center_longitude,
        'open_now': '1',
        'distance': distance,
        'limit': '0',
    }

    return get_space_json(client, search_args, use_cache, fill_cache, cache_period)

def get_space_json(client, search_args, use_cache, fill_cache, cache_period):
    # We don't want the management command that fills the cache to get
    # a cached value
    if use_cache:
        cache_key = get_key_for_search_args(search_args)

        # The cache is (hopefully) filled from the load_open_now_cache
        # management command
        cached = cache.get(cache_key)
        if cached:
            return json.loads(cached)

    values = fetch_space_json(client, search_args)

    # this needs to look like a search result

    data = json.loads(values)

    # type needs to look like what /search query returns
    for space in data:
        if 'type' in space and isinstance(space['type'], types.ListType):
            typelist = []
            for t in space['type']:
                typelist.append(_(t))

            space["type"] = ','.join(typelist)

    if fill_cache:
        cache_key = get_key_for_search_args(search_args)

        cache.set(cache_key, values, cache_period)

    return data

def fetch_space_json(client, search_args):
    query = []
    for key, value in search_args.items():
        query.append("%s=%s" % (key, value))

    url = "{0}/api/v1/spot/?{1}".format(settings.SS_WEB_SERVER_HOST, "&".join(query))
    resp, content = client.request(url, 'GET')

    if resp.status == 200:
        return content

    return '[]'


#TODO: use the new buildings view instead
def get_building_json(client):
    url = "{0}/api/v1/buildings".format(settings.SS_WEB_SERVER_HOST)
    resp, content = client.request(url, 'GET')

    if resp.status == 200:
        return content

    return '[]'


#TODO: use the favorites view instead
def get_favorites_json(headers, client):
    url = "{0}/api/v1/user/me/favorites".format(settings.SS_WEB_SERVER_HOST)

    resp, content = client.request(url, method='GET', headers=headers)

    if resp.status == 200:
        return content

    return '[]'


def log_shared_space_reference(request, headers, client):
    # log shared space references
    m = re.match(r'^/space/(\d+)/.*/([a-f0-9]{32})$', request.path)
    if m:
        try:
            url = "{0}/api/v1/spot/{1}/shared".format(settings.SS_WEB_SERVER_HOST, m.group(1))

            resp, content = client.request(url,
                                           method='PUT',
                                           body=json.dumps({ 'hash': m.group(2) }),
                                           headers=headers)

            # best effort, ignore response
        except:
            pass
