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
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.cache import never_cache
import ldap
import simplejson as json

# Shim to LDAP directory search
@never_cache
def API(request):
    
    if request.META['REQUEST_METHOD'] != 'GET':
        return HttpResponse('Method not allowed', status=405)

    result = []

    if hasattr(settings, 'SS_LDAP_DIRECTORY') and 'q' in request.GET:
        try:
            q = request.GET.get('q');
            l = ldap.initialize('ldap://' + settings.SS_LDAP_DIRECTORY)

            if hasattr(settings, 'SS_LDAP_SEARCH_BASE'):
                base = settings.SS_LDAP_SEARCH_BASE
            else:
                base = ''

            ldap_id = l.search(base, ldap.SCOPE_SUBTREE,
                               '(|(mail=%s*)(cn=%s*))' % (q, q), None)

            while 1:
                result_type, result_data = l.result(ldap_id, 0)
                if not result_data or len(result_data) == 0:
                    break;
                else:
                    if result_type == ldap.RES_SEARCH_ENTRY:
                        try:
                            result.append({ 'name': result_data[0][1]['cn'][0],
                                            'email': result_data[0][1]['mail'][0] })
                        except:
                            pass
            
        except ldap.LDAPError, e:
            pass


    return HttpResponse(json.dumps(result), mimetype='application/json', status=200)
