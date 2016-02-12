#!/usr/bin/env python

from distutils.core import setup

setup(name='SpaceScout-Web',
      version='1.0',
      description='Web frontend for SpaceScout',
      install_requires=[
                        'Django>=1.4,<1.5',
                        'oauth2',
                        'oauth_provider',
                        'django-compressor<2.0',
                        'django-mobility',
                        'django-templatetag-handlebars',
                        'simplejson',
                        'python-ldap',
                       ],
     )
