from django.test import TestCase
from django.utils.unittest import skipUnless
from django.test.client import RequestFactory
from django.conf import settings
from spacescout_web.org_filters.uw_search import Filter
from spacescout_web.org_filters.__init__ import SearchFilterChain


@skipUnless(
        getattr(settings, 'SPACESCOUT_SEARCH_FILTERS', False) and
        settings.SPACESCOUT_SEARCH_FILTERS ==
        ['spacescout_web.org_filters.uw_search.Filter'],
        "Skip unless the right search filter is defined in settings"
    )
class URLFiltering(TestCase):
    """ Tests rendering 404 template and returning 404 status code
    """

    def test_no_args(self):
        factory = RequestFactory()
        request = factory.get('/seattle/')
        chain = SearchFilterChain(request)
        search_args = chain.url_args(request)
        self.assertEqual([], search_args)

        request = factory.get('/seattle')
        chain = SearchFilterChain(request)
        search_args = chain.url_args(request)
        self.assertEqual([], search_args)

        request = factory.get('/')
        chain = SearchFilterChain(request)
        search_args = chain.url_args(request)
        self.assertEqual([], search_args)

    def test_one_arg(self):
        factory = RequestFactory()
        request = factory.get('/seattle/cap:1')
        chain = SearchFilterChain(request)
        search_args = chain.url_args(request)
        # Seattle doesn't come back because it is dealt with outside of
        # the method being tested here
        self.assertEqual([{'capacity': 1}], search_args)

    def test_multiple_args(self):
        factory = RequestFactory()
        request = factory.get('/seattle/cap:1|rol')
        chain = SearchFilterChain(request)
        search_args = chain.url_args(request)
        self.assertEqual([{'capacity': 1},
                          {'extended_info:has_outlets': 'true'}],
                         search_args)
