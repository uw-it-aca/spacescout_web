""" Copyright 2012, 2013 UW Information Technology, University of Washington

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
"""
from django.conf.urls.defaults import patterns, include, url

urlpatterns = patterns('spacescout_web.views',
    url(r'^$', 'home.HomeView'),
    url(r'login$', 'auth.Prompt'),
    url(r'authenticate$', 'auth.Login'),
    url(r'logout$', 'auth.Logout'),
    url(r'buildings?$', 'buildings.buildings'),
    url(r'search/$', 'search.SearchView'),
    url(r'suggest/$', 'suggest.suggest', name="suggest-form"),
    url(r'contact(?:/(?P<spot_id>\d+))?/$', 'contact.contact'),
    url(r'sorry(?:/(?P<spot_id>\d+))?/$', 'contact.sorry'),
    url(r'thankyou(?:/(?P<spot_id>\d+))?/$', 'contact.thank_you'),
    url(r'favorites?$', 'favorites.Favorites'),
    url(r'space/(?P<spot_id>\d+)/$', 'spot.SpotView'),
    url(r'space/(?P<spot_id>\d+)/json/$', 'spot.SpotView', {'return_json': True}),
    url(r'space/(?P<spot_id>\d+)/image/(?P<image_id>\d+)/thumb/constrain/width:(?P<thumb_width>\d+)(?:,height:(?P<thumb_height>\d+))?$', 'image.ImageView', {'constrain': True}),
    url(r'space/(?P<spot_id>\d+)/image/(?P<image_id>\d+)/thumb/constrain/height:(?P<thumb_height>\d+)(?:,width:(?P<thumb_width>\d+))?$', 'image.ImageView', {'constrain': True}),
    url(r'space/(?P<spot_id>\d+)/image/(?P<image_id>\d+)/thumb/(?P<thumb_width>\d+)x(?P<thumb_height>\d+)$', 'image.ImageView'),
    url(r'images/(?P<image_ids>[\d,]+)/thumb/constrain/width:(?P<thumb_width>\d+)(?:,height:(?P<thumb_height>\d+))?$', 'image.MultiImageView', {'constrain': True}),
)
