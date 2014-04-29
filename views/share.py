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
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from spacescout_web.forms.share import ShareForm
from django.conf import settings
from django.utils.http import urlquote
from spacescout_web.spot import Spot, SpotException
import oauth2
import socket
import simplejson as json

def share(request, spot_id=None):
    if request.method == 'POST':
        form = ShareForm(request.POST)
        back = request.POST['back'] if 'back' in request.POST else '/'
        if form.is_valid():
            spot_id = form.cleaned_data['spot_id']
            back = form.cleaned_data['back']
            sender = form.cleaned_data['sender']
            recipient = form.cleaned_data['recipient']
            subject = form.cleaned_data['subject']
            message = form.cleaned_data['message']
            bot_test = form.cleaned_data['email_confirmation']

            url = "{0}/api/v1/spot/{1}/share".format(settings.SS_WEB_SERVER_HOST, spot_id)

            body = json.dumps({
                'to': recipient,
                'from': sender,
                'comment': message,
                'subject': subject
            })

            headers = {
                "XOAUTH_USER": "%s" % request.user.username,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }

            consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
            client = oauth2.Client(consumer)

            resp, content = client.request(url,
                                           method='PUT',
                                           body=body,
                                           headers=headers)

            if not (resp.status == 200 or resp.status == 201):
                return HttpResponseRedirect('/sorry/')

            return HttpResponseRedirect('/thankyou/?back=' + urlquote(back))
    else:
        back = request.GET['back'] if request.GET and 'back' in request.GET else '/'
        if request.user and request.user.is_authenticated():
            consumer = oauth2.Consumer(key=settings.SS_WEB_OAUTH_KEY, secret=settings.SS_WEB_OAUTH_SECRET)
            client = oauth2.Client(consumer)
            url = "{0}/api/v1/user/me".format(settings.SS_WEB_SERVER_HOST)

            headers = {
                "XOAUTH_USER": "%s" % request.user.username,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                }

            resp, content = client.request(url,
                                           method='GET',
                                           headers=headers)

            sender = "%s@%s" % (request.user.username, getattr(settings, 'SS_MAIL_DOMAIN', 'uw.edu'))
            if resp.status == 200:
                me = content = json.loads(content)
                if 'email' in me and len(me['email']):
                    sender = me['email']
        else:
            sender = ''

        form = ShareForm(initial={
                'spot_id':spot_id,
                'back': back,
                'sender': sender,
                'subject': 'Check out this space I found on SpaceScout',
            })

    try:
        spot = Spot(spot_id).get()
        floor = "Floor %s" % (spot["location"]["floor"])
        share_text = [spot["name"], spot["type"], floor]
    except SpotException:
        share_text = ['Unrecognized Spot']

    share_url = 'http://%s/space/%s/%s' % (getattr(settings, 'SS_APP_SERVER', socket.gethostname()),
                                           spot_id, urlquote(spot["name"]))

    return render_to_response('spacescout_web/share-form.html', {
        'form': form,
        'back': back,
        'spot_id': spot_id,
        'share_text': share_text,
        'share_url': share_url,
        'hidden': ["spot_id", "back"],
        'is_mobile': (request.MOBILE == 1),
    }, context_instance=RequestContext(request))
