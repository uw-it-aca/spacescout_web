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
            problem = form.cleaned_data['problem']
            feedback = form.cleaned_data['feedback']
            
            subject = "Form Test"
            #subject = if problem or feedback
            #spot = grab which spot link was clicked on
            #device = what browser or device they used

            recipients = ['samolds@yahoo.com']

            from django.core.mail import send_mail
            send_mail(subject, message, sender, recipients)
            return HttpResponseRedirect('/contact/thanks/')
    else:
        form = ContactForm()

    return render(request, 'contact.html', {'form': form})

def ThanksView(request):
    return render_to_response('thanks.html')
