from django.conf.urls.defaults import patterns, include, url

urlpatterns = patterns('spacescout_web.views',
    url(r'^$', 'home.HomeView'),
    url(r'buildings?$', 'buildings.buildings'),
    url(r'search/$', 'search.SearchView'),
    url(r'contact(?:/(?P<spot_id>\d+))?/$', 'contact.contact'),
    url(r'sorry(?:/(?P<spot_id>\d+))?/$', 'contact.sorry'),
    url(r'thankyou(?:/(?P<spot_id>\d+))?/$', 'contact.thank_you'),
    url(r'space/(?P<spot_id>\d+)$', 'spot.SpotView'),
    url(r'space/(?P<spot_id>\d+)/json/$', 'spot.SpotView', {'return_json': True}),
    url(r'space/(?P<spot_id>\d+)/image/(?P<image_id>\d+)/thumb/constrain/width:(?P<thumb_width>\d+)(?:,height:(?P<thumb_height>\d+))?$', 'image.ImageView', {'constrain': True}),
    url(r'space/(?P<spot_id>\d+)/image/(?P<image_id>\d+)/thumb/constrain/height:(?P<thumb_height>\d+)(?:,width:(?P<thumb_width>\d+))?$', 'image.ImageView', {'constrain': True}),
    url(r'space/(?P<spot_id>\d+)/image/(?P<image_id>\d+)/thumb/(?P<thumb_width>\d+)x(?P<thumb_height>\d+)$', 'image.ImageView'),
)
