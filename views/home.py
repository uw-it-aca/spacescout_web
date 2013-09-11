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
from django.utils.datastructures import SortedDict
from mobility.decorators import mobile_template
from django.core.exceptions import ImproperlyConfigured

@mobile_template('{mobile/}app.html')
def HomeView(request, template=None):
    # Default to zooming in on the UW Seattle campus if no default location is set
    if hasattr(settings, 'SS_DEFAULT_LOCATION'):
        loc = settings.SS_LOCATIONS[settings.SS_DEFAULT_LOCATION]
        center_latitude = loc['CENTER_LATITUDE']
        center_longitude = loc['CENTER_LONGITUDE']
        zoom_level = loc['ZOOM_LEVEL']
        default_location = settings.SS_DEFAULT_LOCATION
        locations = settings.SS_LOCATIONS
    else:
        center_latitude = '47.655003'
        center_longitude = '-122.306864'
        zoom_level = '15'

    if (hasattr(settings, 'SS_BUILDING_CLUSTERING_ZOOM_LEVELS') and hasattr(settings, 'SS_DISTANCE_CLUSTERING_RATIO')):
        by_building_zooms = settings.SS_BUILDING_CLUSTERING_ZOOM_LEVELS
        by_distance_ratio = settings.SS_DISTANCE_CLUSTERING_RATIO
    else:
        raise ImproperlyConfigured("You need to configure your clustering constants in settings.py or local_settings.py")

    search_args = {
        'center_latitude': center_latitude,
        'center_longitude': center_longitude,
        'open_now': '1',
        'distance': '500',
        'limit': '0',
    }

    for key in request.GET:
        search_args[key] = request.GET[key]

    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)

    spaces = get_space_json(client, search_args)
    buildings = json.loads(get_building_json(client))

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
        'center_latitude': center_latitude,
        'center_longitude': center_longitude,
        'zoom_level': zoom_level,
        'locations': locations,
        'default_location': default_location,
        'by_building_zooms': by_building_zooms,
        'by_distance_ratio': by_distance_ratio,
        'buildingdict': buildingdict,
        'spaces': spaces,
    }

    return render_to_response(template, params, context_instance=RequestContext(request))


def get_space_json(client, search_args):
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
