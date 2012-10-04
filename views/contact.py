from django.shortcuts import render_to_response, render
from django.http import HttpResponseRedirect
from spacescout_web.forms.contact import ContactForm

def ContactView(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            sender = form.cleaned_data['sender']
            message = form.cleaned_data['message']
            feedback_choice = form.cleaned_data['feedback_choice']

            #spot = grab which spot link was clicked on
            #device = what browser or device they used

            subject = "SpaceScout %s from %s" %(feedback_choice, name)
            email_message = "SpaceScout Web - %s \n\n %s \n\n %s - %s" %(feedback_choice, message, name, sender)
            report_a_problem_recipient = 'samolds@yahoo.com'
            recipients = [report_a_problem_recipient]

            from django.core.mail import send_mail
            send_mail(subject, email_message, sender, recipients)
            return HttpResponseRedirect('/contact/thanks/')
    else:
        form = ContactForm()

    return render(request, 'contact.html', {'form': form})

def ThanksView(request):
    return render_to_response('thanks.html')
