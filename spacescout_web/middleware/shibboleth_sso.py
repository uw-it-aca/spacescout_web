"""
Copyright 2013 Board of Trustees, University of Illinois

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
Allow a custom header for Shibboleth when run from behind a proxy
(ie: gunicorn configuration).
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

