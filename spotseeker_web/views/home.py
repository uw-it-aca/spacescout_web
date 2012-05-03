from django.shortcuts import render_to_response
from django.template import RequestContext
from django.conf import settings

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

    return render_to_response('search/results.html', {
        'center_latitude': center_latitude,
        'center_longitude': center_longitude,
        'zoom_level': zoom_level,
    }, context_instance=RequestContext(request))
