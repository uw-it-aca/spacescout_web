from django import forms

class ContactForm(forms.Form):
        name = forms.CharField(max_length=25)
        sender = forms.EmailField(max_length=40)
        message = forms.CharField(max_length=300)
        problem = forms.BooleanField(required=False)
        feedback = forms.BooleanField(required=False)
