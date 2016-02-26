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
from spacescout_web.spot import Spot, SpotException
from django.http import Http404
from django.http import HttpResponse
import simplejson as json


def SpotView(request, spot_id, return_json=False):
    try:
        spot = Spot(spot_id).get()
    except SpotException as e:
        if e.resp.status == 404:
            url = request.get_host()
            url = url + "/contact"
            raise Http404
        elif e.resp.status != 200:
            response = HttpResponse("Error loading spot")
            response.status_code = e.resp.status_code
            return response

    content = json.dumps(spot)

    if return_json:
        return HttpResponse(content, mimetype='application/json')
    else:
        return render_to_response('spacescout_web/space.html', spot, context_instance=RequestContext(request))
