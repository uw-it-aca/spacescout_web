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

    search_args = {
        'center_latitude': center_latitude,
        'center_longitude': center_longitude,
        'open_now': '1',
        'distance': '500',
    }

    for key in request.GET:
        search_args[key] = request.GET[key]

    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)

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

    # See if django-compressor is being used to precompile less
    if settings.COMPRESS_ENABLED:
        less_not_compiled = False
    else:
        less_not_compiled = True

    # See if there is a Google Analytics web property id
    try:
        ga_tracking_id = settings.GA_TRACKING_ID
    except:
        ga_tracking_id = None

    params = {
        'center_latitude': center_latitude,
        'center_longitude': center_longitude,
        'zoom_level': zoom_level,
        'locations': locations,
        'default_location': default_location,
        'buildingdict': buildingdict,
        'is_mobile': request.MOBILE,
        'less_not_compiled': less_not_compiled,
        'ga_tracking_id': ga_tracking_id,
    }

    return render_to_response(template, params, context_instance=RequestContext(request))


#TODO: use the new buildings view instead
def get_building_json(client):
    url = "{0}/api/v1/buildings".format(settings.SS_WEB_SERVER_HOST)
    resp, content = client.request(url, 'GET')

    if resp.status == 200:
        return content

    return '[]'
