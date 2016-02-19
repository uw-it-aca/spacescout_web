from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'spacescout.views.home', name='home'),
    # url(r'^spacescout/', include('spotseeker.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^oauth/', include('oauth_provider.urls')),
    url(r'', include('spacescout_web.urls')),
)

handler404 = 'spacescout_web.views.error.page_not_found'

urlpatterns += staticfiles_urlpatterns()
