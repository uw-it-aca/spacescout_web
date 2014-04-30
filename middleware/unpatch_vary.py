""" Copyright 2013 Board of Trustees, University of Illinois

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

    Description
    =================================================================
    Middleware that looks at a response and removes listed headers
    from the Vary header. This is to change how certain views are cached.

    This middleware must go just after the UpdateCacheMiddleware.
"""
from django.http import HttpResponse
from functools import wraps
import re

HEADER_UNPATCH_VARY = 'X-Unpatch-Vary'


def unpatch_vary_headers(response, headers):
    """Add the headers to the list of unpatch vary headers.
    """
    unpatch_headers = re.split(r'\s*,\s*', response.get(HEADER_UNPATCH_VARY, ''))
    unpatch_headers.extend(headers)
    response[HEADER_UNPATCH_VARY] = ','.join(unpatch_headers)
    return response


class UnpatchVaryMiddleware(object):
    def process_response(self, request, response):
        """ See if we have any headers to remove from Vary,
            and do such!
        """
        if not (response and response.has_header(HEADER_UNPATCH_VARY)):
            return response
        unpatch_headers = re.split(r'\s*,\s*', response[HEADER_UNPATCH_VARY])
        del response[HEADER_UNPATCH_VARY]
        if len(unpatch_headers) == 0:
            return response

        if not response.has_header('Vary'):
            return response
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
