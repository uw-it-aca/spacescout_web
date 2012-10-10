from django.shortcuts import render_to_response
from django.template import RequestContext
from django.conf import settings
import oauth2
import simplejson as json


def HomeView(request):

    # Default to zooming in on the UW Seattle campus
    if hasattr(settings, 'DEFAULT_CENTER_LATITUDE'):
        center_latitude = settings.DEFAULT_CENTER_LATITUDE
    else:
        center_latitude = '47.655003'

    if hasattr(settings, 'DEFAULT_CENTER_LONGITUDE'):
        center_longitude = settings.DEFAULT_CENTER_LONGITUDE
    else:
        center_longitude = '-122.306864'

    if hasattr(settings, 'DEFAULT_ZOOM_LEVEL'):
        zoom_level = settings.DEFAULT_ZOOM_LEVEL
    else:
        zoom_level = '15'

    search_args = {
        'center_latitude': center_latitude,
        'center_longitude': center_longitude,
        'open_now': '1',
        'distance': '500',
    }

    for key in request.GET:
        search_args[key] = request.GET[key]
    if 'spot_id' in request.session:
        del request.session['spot_id']

    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)

    buildings = json.loads(get_building_json(client))
    buildings.sort()

    # This could probably be a template tag, but didn't seem worth it for one-time use
    buildingdict = {}
    for building in buildings:
        if not building[0] in buildingdict.keys():  # building[0] is the first letter of the string
            buildingdict[building[0]] = []

        buildingdict[building[0]].append(building)

    # See if django-compressor is being used to precompile less
    if settings.COMPRESS_ENABLED:
        less_not_compiled = False
    else:
        less_not_compiled = True

    return render_to_response('app.html', {
        'center_latitude': center_latitude,
        'center_longitude': center_longitude,
        'zoom_level': zoom_level,
        'buildingdict': buildingdict,
        'is_mobile': request.MOBILE,
        'less_not_compiled': less_not_compiled,
    }, context_instance=RequestContext(request))


def get_building_json(client):
    url = "{0}/api/v1/buildings".format(settings.SS_WEB_SERVER_HOST)
    resp, content = client.request(url, 'GET')

    if resp.status == 200:
        return content

    return '[]'
