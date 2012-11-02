from django.shortcuts import render_to_response
from django.template import RequestContext
from mobility.decorators import mobile_template


@mobile_template('{mobile/}404.html')
def page_not_found(request, template=None):
    return render_to_response(template, {'request_path': request.META['PATH_INFO']}, context_instance=RequestContext(request))
