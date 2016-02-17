"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import TestCase
from spacescout_web import views as s_views
from views import spot as s_spot
import unittest
import mock
from mock import patch
from django.test.client import RequestFactory
from django.test import Client
import logging

class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.assertEqual(1 + 1, 2)

class HtmlTest(TestCase):

    def test_replace_urls(self):
        """
        Tests that the replaceUrls function in global.js works.
        """
        client = Client()

        mock_data = {'display_access_restrictions': u'',
                     'capacity': 200, 'name': 'This is a computer lab',
                     'type': u'Computer lab,Production studio',
                     'extended_info': {'campus': 'seattle',
                                       'reservation_notes': 'wooooo',
                                       'access_notes': 'even better',
                                       'hours_notes': 'The times listed change so check this site: http://uw.edu/'},
                     'uri': '/api/v1/spot/1',
                     'available_hours': {'monday': [['00:00', '23:59']],
                                         'tuesday': [['00:00', '23:59']],
                                         'friday': [['00:00', '23:59']],
                                         'wednesday': [['00:00', '23:59']],
                                         'thursday': [['00:00', '23:59']],
                                         'sunday': [['00:00', '23:59']],
                                         'saturday': [['00:00', '23:59']]},
                     'manager': u'',
                     'last_modified': '09/15/2014',
                     'etag': 'fef14e1ba96fd80fc2137a5036a8647fc5e26b6f',
                     'images': [],
                     'organization': u'',
                     'external_id': None,
                     'id': 1,
                     'location': {'floor': u'',
                                  'height_from_sea_level': None,
                                  'room_number': u'',
                                  'longitude': -122.306644,
                                  'latitude': 47.658241,
                                  'building_name': 'Art Building'}}

        with patch.object(s_spot, 'SpotView', return_value=mock_data):
            response = client.get('space/3465/json/', REMOTE_ADDR='0.0.0.0')

        expected = '<p class="hours_notes">{{ extended_info.hours_notes }}</p>'
        log= logging.getLogger( "HTMLTest.test_replace_urls" )
        log.debug("response=%r", response.content)

        content = response.content
        contains = content.find(expected) != -1

        self.assertTrue(contains)
