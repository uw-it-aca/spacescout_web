"""
License: see UIUC_LICENSE.txt

Modifies the search arguments before send it to spotseeker_server.
"""

from spacescout_web.org_filters import SearchFilter
import sys

class Filter(SearchFilter):
    def filter_args(self, args):
        if 'shibboleth' in sys.modules and self.request.user.is_authenticated():
            args['eppn'] = request.user.username

        return args

