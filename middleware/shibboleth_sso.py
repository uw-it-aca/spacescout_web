"""
Copyright (c) 2013 University of Illinois Board of Trustees
All rights reserved.

Developed by:   CITES-ICS
                University of Illinois at Urbana Champaign
                http://www.cites.illinois.edu/ics

==== License ====

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal with the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

    - Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimers.

    - Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the following
    disclaimers in the documentation and/or other materials provided
    with the distribution.

    Neither the names of CITES-ICS, University of Illinois at Urbana-
    Champaign, nor the names of its contributors may be used to
    endorse or promote products derived from this Software without
    specific prior written permission.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE CONTRIBUTORS OR COPYRIGHT HOLDERS BE LIABLE FOR
ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS WITH THE SOFTWARE.

==== Description ====

Middleware for our configuration.
"""
from __future__ import absolute_import, unicode_literals

from django.conf import settings
from django.core.exceptions import SuspiciousOperation
from ipaddress import ip_address
import logging

from shibboleth.middleware import ShibbolethRemoteUserMiddleware as OrigShibbolethRemoteUserMiddleware

logger = logging.getLogger(__name__)

class ShibbolethRemoteUserMiddleware(OrigShibbolethRemoteUserMiddleware):
    """ Allow the use of headers when coming from a trusted proxy. """
    header = 'HTTP_SSO_USER'

