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
    Modifies the search arguments before send it to spotseeker_server.
"""

from spacescout_web.org_filters import SearchFilter
import sys

class Filter(SearchFilter):
    def filter_args(self, args):
        if 'shibboleth' in sys.modules and self.request.user.is_authenticated():
            args['eppn'] = self.request.user.username

        return args

