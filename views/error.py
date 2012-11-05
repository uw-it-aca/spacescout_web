from django.shortcuts import render_to_response
from django.template import RequestContext
from django.conf import settings
from mobility.decorators import mobile_template


@mobile_template('{mobile/}404.html')
def page_not_found(request, template=None):
    
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
        'request_path': request.META['PATH_INFO'],
        'less_not_compiled': less_not_compiled,
        'ga_tracking_id': ga_tracking_id,
    }
    return render_to_response(template, params, context_instance=RequestContext(request))
