from django.shortcuts import render_to_response
from django.conf import settings
import oauth2
import types
import urllib

def HomeView(request):

    # Required settings for the client

    if not hasattr(settings, 'SS_WEB_SERVER_HOST'):
        raise(Exception("Required setting missing: SS_WEB_SERVER_HOST"))
    if not hasattr(settings, 'SS_WEB_OAUTH_KEY'):
        raise(Exception("Required setting missing: SS_WEB_OAUTH_KEY"))
    if not hasattr(settings, 'SS_WEB_OAUTH_SECRET'):
        raise(Exception("Required setting missing: SS_WEB_OAUTH_SECRET"))

    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret = settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)



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
        zoom_level = DEFAULT_ZOOM_LEVEL
    else:
        zoom_level = '15'


    json = get_spot_search_json(client, {
        'center_latitude': center_latitude,
        'center_longitude': center_longitude,
        'open_now': '1',
        'distance': '500',
    })

    return render_to_response('search/results.html', {
        'center_latitude': center_latitude,
        'center_longitude': center_longitude,
        'zoom_level': zoom_level,
        'found_spots': json,
    })


def get_spot_search_json(client, options):
    args = []
    for key in options:
        print type(options[key])
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
