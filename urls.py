from django.conf.urls.defaults import patterns, include, url

urlpatterns = patterns('spacescout_web.views',
    url(r'^$', 'home.HomeView'),
    url(r'search/$', 'search.SearchView'),
    url(r'contact/$', 'contact.ContactView'),
    url(r'contact/sorry/$', 'contact.SorryView'),
    url(r'contact/thankyou/$', 'contact.ThankYouView'),
    url(r'space/(?P<spot_id>\d+)$', 'spot.SpotView'),
    url(r'space/(?P<spot_id>\d+)/json/$', 'spot.SpotView', {'return_json':True}),
    url(r'space/(?P<spot_id>\d+)/image/(?P<image_id>\d+)/thumb/(?P<thumb_width>\d+)x(?P<thumb_height>\d+)$', 'image.ImageView'),
)
