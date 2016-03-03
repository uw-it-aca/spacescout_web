from django.conf import settings


def show_ios_smart_banner(request):
    """ Should we alert the user that an iOS app is in the app store?
    """
    try:
        return {'show_ios_smart_banner': settings.SHOW_IOS_SMART_BANNER}
    except:
        return {'show_ios_smart_banner': False}


def is_mobile(request):
    """ See if it's mobile mode
    """
    if request.MOBILE == 1:
        return {'is_mobile': True}
    else:
        return {'is_mobile': False}


def less_not_compiled(request):
    """ See if django-compressor is being used to precompile less
    """
    if settings.COMPRESS_ENABLED:
        return {'less_not_compiled': False}
    else:
        return {'less_not_compiled': True}


def ga_tracking_id(request):
    """ See if there is a Google Analytics web property id
    """
    try:
        return {'ga_tracking_id': settings.GA_TRACKING_ID}
    except:
        return {'ga_tracking_id': None}


def gmaps_api_key(request):
    """ See if there is a Google Analytics web property id
    """
    try:
        return {'gmaps_api_key': settings.GMAPS_API_KEY}
    except:
        return {'gmaps_api_key': None}
