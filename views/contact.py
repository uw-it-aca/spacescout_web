from django.shortcuts import render_to_response, render
from django.template import RequestContext
from django.http import HttpResponseRedirect
from spacescout_web.forms.contact import ContactForm
from django.core.mail import send_mail
from django.conf import settings
import simplejson as json
import urllib2

def contact(request, spot_id=None):
    contact_variables = _contact_variables(request, spot_id)

    back = contact_variables['back']
    is_mobile = contact_variables['is_mobile']
    spot_name = contact_variables['spot_name']
    spot_description = contact_variables['spot_description']

    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            sender = form.cleaned_data['sender']
            message = form.cleaned_data['message']
            #feedback_choice = form.cleaned_data['feedback_choice']
            feedback_choice = 'problem'
            bot_test = form.cleaned_data['email_confirmation']

            if spot_id == None:
                spot_id = ''
                displayed_spot_id = 'Unknown'
            else:
                displayed_spot_id = spot_id
            browser = request.META.get('HTTP_USER_AGENT', 'Unknown')

            subject = "SpaceScout %s from %s" %(feedback_choice, name)
            email_message = "SpaceScout Web - %s \n\n %s \n\n %s %s \n %s - ID = %s \
                \n Browser Type = %s" %(feedback_choice, message, name, sender, spot_name, displayed_spot_id, browser)

            if bot_test == '':
                try:
                    send_mail(subject, email_message, sender, settings.FEEDBACK_EMAIL_RECIPIENT)
                except:
                    return HttpResponseRedirect('/sorry/' + spot_id )
            return HttpResponseRedirect('/thankyou/' + spot_id)
    else:
        form = ContactForm()

    # See if django-compressor is being used to precompile less
    if settings.COMPRESS_ENABLED:
        less_not_compiled = False
    else:
        less_not_compiled = True

    return render_to_response('contact-form.html', {
        'form': form,
        'is_mobile': is_mobile,
        'less_not_compiled': less_not_compiled,
        'back': back,
        'spot_name': spot_name,
        'spot_description': spot_description,
        'spot_id': spot_id,
    }, context_instance=RequestContext(request))

def thank_you(request, spot_id=None):
    contact_variables = _contact_variables(request, spot_id)

    back = contact_variables['back']
    is_mobile = contact_variables['is_mobile']

    return render_to_response('contact-thankyou.html', {
        'spot_id': spot_id,
        'back': back,
        'is_mobile': is_mobile
    }, context_instance=RequestContext(request))

def sorry(request, spot_id=None):
    contact_variables = _contact_variables(request, spot_id)

    back = contact_variables['back']
    email = settings.FEEDBACK_EMAIL_RECIPIENT[0]
    is_mobile = contact_variables['is_mobile']
    #should maybe do something here ^. raise improperly configured exception if there are no emails in the list in settings.py

    return render_to_response('contact-sorry.html', {
        'spot_id': spot_id,
        'back': back,
        'email': email,
        'is_mobile': is_mobile
    }, context_instance=RequestContext(request))

def _contact_variables(request, spot_id):
    spot_name = 'Unknown'
    spot_description = ''

    if spot_id != None:
        url = "{0}/space/{1}/json".format("http://butterfinger.cac.washington.edu:8001", spot_id)
        try:
            content = urllib2.urlopen(url).read()
            params = json.loads(content)
            if 'name' in params:
                spot_name = params['name']
            if 'extended_info' in params:
                if 'location_description' in params['extended_info']:
                    spot_description = params['extended_info']['location_description']
        except urllib2.HTTPError as e:
            spot_id = None
            print e.code

    if request.MOBILE == 1:
        is_mobile = True
    else:
        is_mobile = False

    if is_mobile and spot_id != None:
        back = ('/space/' + spot_id)
    else:
        back = '/'

    return {
        'spot_name':spot_name,
        'spot_description':spot_description,
        'is_mobile':is_mobile,
        'back':back
    }
