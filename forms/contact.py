from django import forms

class ContactForm(forms.Form):
        name = forms.CharField(max_length=25, label="Your Name")
        sender = forms.EmailField(max_length=40, label="Your Email")
        feedback_choice = forms.ChoiceField((
            ('', 'Please Select One'),
            ('feedback', 'Leave Feedback'),
            ('problem', 'Report a Problem'),
            ('feature', 'Request a Feature')), label="Feedback Choice")
        message = forms.CharField(widget=forms.Textarea(), label="Your Message")
        bot_test = forms.CharField(required=False)
