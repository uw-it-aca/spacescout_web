"""
Middleware that looks at a response and removes listed headers
from the Vary header. This is to change how certain views are cached.

This middleware must go just after the UpdateCacheMiddleware.
"""
from django.http import HttpResponse
from functools import wraps
import re

def unpatch_vary_headers(response, headers):
    if not hasattr(response, '_unpatch_vary_headers'):
        response._unpatch_vary_headers = []
    response._unpatch_vary_headers.extend(headers)
    return response

class UnpatchVaryMiddleware(object):
    def process_response(self, request, response):
        if not response or not response.has_header('Vary'):
            return response

        unpatch_headers = getattr(response, '_unpatch_vary_headers', [])
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

        return response
