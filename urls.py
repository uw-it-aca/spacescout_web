from django.conf.urls.defaults import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'spotseeker_web.views.home.HomeView'),
    url(r'search/$', 'spotseeker_web.views.search.SearchView'),
    url(r'spot/(?P<spot_id>\d+)$', 'spotseeker_web.views.spot.SpotView'),
)
