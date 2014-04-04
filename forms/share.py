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


class ShareForm(forms.Form):
        back = forms.CharField(widget=forms.HiddenInput())
        spot_id = forms.IntegerField(widget=forms.HiddenInput())
        sender = forms.EmailField(max_length=128, label="From", required=True)
        recipient = forms.EmailField(max_length=128, label="To", required=True)
        subject = forms.CharField(max_length=128, label="Subject", required=False)
        message = forms.CharField(widget=forms.Textarea(), label="Your Message (optional)", required=False)
        email_confirmation = forms.CharField(required=False)
