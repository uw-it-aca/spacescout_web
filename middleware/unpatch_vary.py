"""
Middleware that looks at a response and removes listed headers
from the Vary header. This is to change how certain views are cached.

This middleware must go just after the UpdateCacheMiddleware.
"""
from django.http import HttpResponse
from functools import wraps
import re

HEADER_UNPATCH_VARY = 'X-Unpatch-Vary'

def unpatch_vary_headers(response, headers):
    unpatch_headers = re.split(r'\s*,\s*', response.get(HEADER_UNPATCH_VARY, ''))
    unpatch_headers.extend(headers)
    response[HEADER_UNPATCH_VARY] = ','.join(unpatch_headers)
    return response

class UnpatchVaryMiddleware(object):
    def process_response(self, request, response):
        try:
            if not request.path.find('/thumb/') == -1:
                return response

            if not (response and response.has_header('Vary') and response.has_header(HEADER_UNPATCH_VARY)):
                return response

            unpatch_headers = re.split(r'\s*,\s*', response[HEADER_UNPATCH_VARY])
            if len(unpatch_headers) > 0:
                vary_headers = re.split(r'\s*,\s*', response['Vary'])

                # Try to preserve the case of headers, but still match
                # insensitively
                existing_headers = dict((h.lower(), h) for h in vary_headers)
                for header in unpatch_headers:
                    header = header.lower()
                    if header in existing_headers:
                        del existing_headers[header]
                response['Vary'] = ', '.join(existing_headers.values())
            del response[HEADER_UNPATCH_VARY]
        except Exception as ex:
            pass

        return response
