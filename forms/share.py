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
from django.core.validators import email_re
from django.utils.translation import ugettext as _
import re


email_separator_re = re.compile(r'[^\w\.\-\+@_]+')
     
                                                                                        
def _is_valid_email(email):    
    return email_re.match(email)


class EmailListField(forms.CharField):

    widget = forms.Textarea

    def clean(self, value):
        super(EmailListField, self).clean(value)

        emails = email_separator_re.split(value)

        if not emails:
            raise forms.ValidationError(_(u'Enter at least one e-mail address.'))

        for email in emails:
            if not _is_valid_email(email):
                raise forms.ValidationError(_('%s is not a valid e-mail address.') % email)

        return emails


class ShareForm(forms.Form):
        back = forms.CharField(widget=forms.HiddenInput())
        spot_id = forms.IntegerField(widget=forms.HiddenInput())
        sender = forms.EmailField(max_length=128, label="From", required=True, error_messages={'required':'Required field'})
        recipient = EmailListField(max_length=1028, label="To", required=True, error_messages={'required':'Required field'})
        subject = forms.CharField(max_length=128, label="Subject", required=True)
        message = forms.CharField(widget=forms.Textarea(attrs={'rows': 5}), label="Your Message (optional)", required=False)
        email_confirmation = forms.CharField(required=False)
