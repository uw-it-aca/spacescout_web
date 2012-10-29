from django.shortcuts import render_to_response, render
from django.template import RequestContext
from django.http import HttpResponseRedirect
from spacescout_web.forms.contact import ContactForm
from django.core.mail import send_mail
from django.conf import settings

# See if there is a Google Analytics web property id
try:
    ga_tracking_id = settings.GA_TRACKING_ID
except:
    ga_tracking_id = None

def contact(request):
    back = _session_variables(request)['back']
    is_mobile = _session_variables(request)['is_mobile']
    spot_name = _session_variables(request)['spot_name']
    spot_description = _session_variables(request)['spot_description']
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            sender = form.cleaned_data['sender']
            message = form.cleaned_data['message']
            #feedback_choice = form.cleaned_data['feedback_choice']
            feedback_choice = 'problem'
            bot_test = form.cleaned_data['email_confirmation']
            spot_id = _session_variables(request)['spot_id']

            browser = request.META.get('HTTP_USER_AGENT', 'Unknown')
            subject = "SpaceScout %s from %s" %(feedback_choice, name)
            email_message = "SpaceScout Web - %s \n\n %s \n\n %s %s \n %s - ID = %s \
                \n Browser Type = %s" %(feedback_choice, message, name, sender, spot_name, spot_id, browser)

            if bot_test == '':
                try:
                    send_mail(subject, email_message, sender, settings.FEEDBACK_EMAIL_RECIPIENT)
                except:
                    return HttpResponseRedirect('/contact/sorry/')

            return HttpResponseRedirect('/contact/thankyou/')
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
        'ga_tracking_id': ga_tracking_id,
    }, context_instance=RequestContext(request))

def thank_you(request):
    back = _session_variables(request)['back']
    is_mobile = _session_variables(request)['is_mobile']
    return render_to_response('contact-thankyou.html', {'back': back, 'is_mobile': is_mobile, 'ga_tracking_id': ga_tracking_id}, context_instance=RequestContext(request))

def sorry(request):
    back = _session_variables(request)['back']
    email = settings.FEEDBACK_EMAIL_RECIPIENT[0]
    is_mobile = _session_variables(request)['is_mobile']
    #should maybe do something here ^. raise improperly configured exception if there are no emails in the list in settings.py
    return render_to_response('contact-sorry.html', {'back': back, 'email': email, 'is_mobile': is_mobile, 'ga_tracking_id': ga_tracking_id}, context_instance=RequestContext(request))

def _session_variables(request):
    if 'spot_name' in request.session:
        spot_name = request.session['spot_name']
    else:
        spot_name = 'Unknown'

    if 'spot_description' in request.session:
        spot_description = request.session['spot_description']
    else:
        spot_description = ''

    if 'spot_id' in request.session:
        spot_id = request.session['spot_id']
    else:
        spot_id = 'Unknown'   

    if request.MOBILE == 1:
        is_mobile = True
    else:
        is_mobile = False

    if is_mobile and spot_id != 'Unknown':
        back = ('/space/' + spot_id)
    else:
        back = '/'

    return {'spot_name':spot_name, 'spot_description': spot_description, 'spot_id':spot_id, 'is_mobile':is_mobile, 'back':back}
