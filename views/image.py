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

    #TODO: really, rather than increase the size of the missing value, we should be able to pass None to get_image
    if constrain is True:
        if thumb_width is None:
            thumb_width = thumb_height * 999

        if thumb_height is None:
            thumb_height = thumb_width * 999

    contenttype, img = get_image(client, spot_id, image_id, thumb_width, thumb_height, constrain)

    response = HttpResponse(img)

    response["Content-type"] = contenttype

    return response


def get_image(client, spot_id, image_id, thumb_width, thumb_height, constrain):
    if constrain is True:
        url = "{0}/api/v1/spot/{1}/image/{2}/thumb/constrain/width:{3},height:{4}".format(settings.SS_WEB_SERVER_HOST, spot_id, image_id, thumb_width, thumb_height)
    else:
        url = "{0}/api/v1/spot/{1}/image/{2}/thumb/{3}x{4}".format(settings.SS_WEB_SERVER_HOST, spot_id, image_id, thumb_width, thumb_height)

    resp, content = client.request(url, 'GET')

    if resp.status == 200:
        return resp['content-type'], content

    return '[]'
