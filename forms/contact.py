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
from django import forms


class ContactForm(forms.Form):
        name = forms.CharField(max_length=25, label="Your Name")
        sender = forms.EmailField(max_length=40, label="Your Email (Optional)", required=False)
        #feedback_choice = forms.ChoiceField((
            #('', 'Please Select One'),
            #('feedback', 'Leave Feedback'),
            #('problem', 'Report a Problem'),
            #('feature request', 'Request a Feature')), label="Feedback Choice")
        message = forms.CharField(widget=forms.Textarea(attrs={'rows': 5}), label="Your Message")
        email_confirmation = forms.CharField(required=False)
