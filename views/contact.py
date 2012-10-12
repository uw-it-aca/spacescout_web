from django.shortcuts import render_to_response, render
from django.template import RequestContext
from django.http import HttpResponseRedirect
from spacescout_web.forms.contact import ContactForm
from django.core.mail import send_mail
from django.conf import settings

def ContactView(request):
    back = _SessionVariables(request)['back']
    is_mobile = _SessionVariables(request)['is_mobile']
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            sender = form.cleaned_data['sender']
            message = form.cleaned_data['message']
            #feedback_choice = form.cleaned_data['feedback_choice']
            feedback_choice = 'problem'
            bot_test = form.cleaned_data['email_confirmation']
            spot_id = _SessionVariables(request)['spot_id']
            if 'spot_name' in request.session:
                spot_name = request.session['spot_name']
            else:
                spot_name = 'Unknown'

            browser = request.META.get('HTTP_USER_AGENT', 'Unknown')
            subject = "SpaceScout %s from %s" %(feedback_choice, name)
            email_message = "SpaceScout Web - %s \n\n %s \n\n %s %s \n %s - ID = %s \
                \n Browser Type = %s" %(feedback_choice, message, name, sender, spot_name, spot_id, browser)

            if bot_test == '':
                #try:
                send_mail(subject, email_message, sender, settings.FEEDBACK_EMAIL_RECIPIENT)
                #except Exception:
                    #return HttpResponseRedirect('/contact/sorry/')

            return HttpResponseRedirect('/contact/thankyou/')
    else:
        form = ContactForm()

     # See if django-compressor is being used to precompile less
    if settings.COMPRESS_ENABLED:
        less_not_compiled = False
    else:
        less_not_compiled = True

    return render_to_response('contact.html', {
        'form': form,
        'is_mobile': is_mobile,
        'less_not_compiled': less_not_compiled,
        'back': back,
    }, context_instance=RequestContext(request))

def ThankYouView(request):
    back = _SessionVariables(request)['back']
    return render_to_response('thankyou.html', {'back': back}, context_instance=RequestContext(request))

def SorryView(request):
    back = _SessionVariables(request)['back']
    email = settings.FEEDBACK_EMAIL_RECIPIENT.pop()
    return render_to_response('sorry.html', {'back': back, 'email': email}, context_instance=RequestContext(request))

def _SessionVariables(request):
    if request.MOBILE == 1:
        is_mobile = True
    else:
        is_mobile = False

    if 'spot_id' in request.session:
        spot_id = request.session['spot_id']
    else:
        spot_id = 'Unknown'

    if is_mobile and spot_id != 'Unknown':
        back = ('/space/' + spot_id)
    else:
        back = '/'

    return {'is_mobile':is_mobile, 'spot_id':spot_id, 'back':back}
