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
    Support for Organization search filters. This allows you to hook
    into views/search
"""
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.utils.importlib import import_module

class SearchFilter(object):
    """
    A search filter base class. Implementers should subclass this and
    redefine the methods they're interested in.

    A new instance of this class is created for each search request.
    
    Instance Variables:
        request: The HTTP request.
        keys: set of keys this filter handles.
    """

    keys = set()

    def __init__(self, request):
        self.request = request

    def filter_args(self, args):
        """
        Filters the search arguments.

        Return a dictionary object, whether you modify it or not.
        """
        return args

class SearchFilterChain(object):
    """
    A collection of filters to run on a spot search. A new instance
    of this class is created for each search.

    Instance Variables:
        request: The HTTP request.
        filters: array of filter instances.
        keys: set of keys this filter chain handles.
    """

    filters = []
    keys = set()

    @staticmethod
    def _load_filters():
        """Loads the filters and their modules"""
        if hasattr(settings, 'SPACESCOUT_SEARCH_FILTERS'):
            for filtername in settings.SPACESCOUT_SEARCH_FILTERS:
                modname, attrname = filtername.rsplit('.', 1)
                try:
                    mod = import_module(modname)
                except ImportError, e:
                    raise ImproperlyConfigured(
                        'Error importing module %s: "%s"' %
                        (modname, e)
                        )

                try:
                    attr = getattr(mod, attrname)
                except AttributeError:
                    raise ImproperlyConfigured(
                        'Module "%s" does not define "%s".' %
                        (modname, attrname))

                SearchFilterChain.filters.append(attr)
                SearchFilterChain.keys.update(attr.keys)

    def __init__(self, request):
        self.request = request

        self.filters = []
        for fclass in SearchFilterChain.filters:
            self.filters.append(fclass(request))

    def filter_args(self, args):
        """Calls filter_args for each defined filter."""
        for f in self.filters:
            args = f.filter_args(args)
        return args

    def url_args(self, args):
        """Calls url_args for each defined filter."""
        search_args = []
        for f in self.filters:
            search_args = f.url_args(args)
        return search_args

    def filters_key(self, key):
        return key in SearchFilterChain.keys

SearchFilterChain._load_filters()

