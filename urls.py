from django.conf.urls.defaults import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'spacescout_web.views.home.HomeView'),
    url(r'search/$', 'spacescout_web.views.search.SearchView'),
    url(r'space/(?P<spot_id>\d+)$', 'spacescout_web.views.spot.SpotView'),
    url(r'space/(?P<spot_id>\d+)/json/$', 'spacescout_web.views.spot.SpotView', {'return_json':True}),
)
