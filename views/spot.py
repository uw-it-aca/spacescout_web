from django.shortcuts import render_to_response
from django.template import RequestContext
from django.conf import settings
import oauth2
import simplejson as json
import re

from django.http import HttpResponse


def SpotView(request, spot_id, return_json=False):
    # Required settings for the client
    if not hasattr(settings, 'SS_WEB_SERVER_HOST'):
        raise(Exception("Required setting missing: SS_WEB_SERVER_HOST"))
    if not hasattr(settings, 'SS_WEB_OAUTH_KEY'):
        raise(Exception("Required setting missing: SS_WEB_OAUTH_KEY"))
    if not hasattr(settings, 'SS_WEB_OAUTH_SECRET'):
        raise(Exception("Required setting missing: SS_WEB_OAUTH_SECRET"))

    consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
    client = oauth2.Client(consumer)

    url = "{0}/api/v1/spot/{1}".format(settings.SS_WEB_SERVER_HOST, spot_id)

    resp, content = client.request(url, 'GET')

    if resp.status == 404:
        response = HttpResponse("Not found")
        response.status_code = 404
        return response
    elif resp.status != 200:
        response = HttpResponse("Error loading spot")
        response.status_code = resp.status_code
        return response

    params = json.loads(content)
    params["last_modified"] = re.sub('-', '/', params["last_modified"][:10])

    # See if django-compressor is being used to precompile less
    if settings.COMPRESS_ENABLED:
        less_not_compiled = False
    else:
        less_not_compiled = True

    params["less_not_compiled"] = less_not_compiled
    request.session['spot_id'] = spot_id

    if return_json:
        return HttpResponse(content, mimetype='application/json')
    else:
        return render_to_response('space.html', params, context_instance=RequestContext(request))
