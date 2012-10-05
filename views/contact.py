from django.shortcuts import render_to_response, render
from django.http import HttpResponseRedirect
from spacescout_web.forms.contact import ContactForm
from django.core.mail import send_mail
from web_proj.settings import FEEDBACK_EMAIL_RECIPIENT

def ContactView(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            sender = form.cleaned_data['sender']
            message = form.cleaned_data['message']
            feedback_choice = form.cleaned_data['feedback_choice']
            bot_test = form.cleaned_data['bot_test']

            if 'spot_id' in request.session:
                spot_id = request.session['spot_id']
            else:
                spot_id = 'Not from a Spot'

            #device = what browser or device they used
            subject = "SpaceScout %s from %s" %(feedback_choice, name)

            email_message = "SpaceScout Web - %s \n\n %s \n\n %s - %s\
                \n Reported from Spot Id = %s" %(feedback_choice, message, name, sender, spot_id)

            if bot_test == '':
                send_mail(subject, email_message, sender, FEEDBACK_EMAIL_RECIPIENT)

            #if spot_id != 'Not from a Spot':
                #return HttpResponseRedirect('/space/' + spot_id)
            #else:
                #return HttpResponseRedirect('/')

            if request.session['path'] == ('/space/' + spot_id + '/json/'):
                return HttpResponseRedirect('/')
            else:
                return HttpResponseRedirect(request.session['path'])
    else:
        form = ContactForm()

    return render(request, 'contact.html', {'form': form})
