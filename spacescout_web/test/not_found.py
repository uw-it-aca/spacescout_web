from django.test import TestCase
import mock
from mock import patch
from django.test.client import Client


class NotFound404Test(TestCase):
    """ Tests rendering 404 template and returning 404 status code
    """

    def test_wrong_url(self):
        """ Requests URL not defined in urls.py. status_code should
        be 404 and content should contain text from spacescout_web/404.html
        """

        client = Client()
        response = client.get("/wrongurl")

        expected = 'Sorry! Scout couldn&#39;t fetch the page at  /wrongurl.'

        # assertContains throws attribute error so using find instead.
        # string1.find(string2) returns the index where string2 is found
        # and returns -1 if not found
        found = response.content.find(expected)
        contains = found != -1

        self.assertEqual(response.status_code, 404)
        self.assertTrue(contains)
