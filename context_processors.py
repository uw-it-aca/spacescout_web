from django.conf import settings


def show_ios_smart_banner(request):
    """ Should we alert the user that an iOS app is in the app store?
    """
    try:
        return {'show_ios_smart_banner': settings.SHOW_IOS_SMART_BANNER}
    except:
        return {'show_ios_smart_banner': False}
