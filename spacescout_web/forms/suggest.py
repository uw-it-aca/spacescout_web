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
from spacescout_web.forms.base import BaseForm


class SuggestForm(BaseForm):
        back = forms.CharField(widget=forms.HiddenInput())
        name = forms.CharField(max_length=25, label="Your Name", required=True, error_messages={'required':'Required field'})
        netid = forms.CharField(max_length=25, label="Your UW NetID", required=True, error_messages={'required':'Required field'})
        sender = forms.EmailField(max_length=40, label="Your Email", required=True, error_messages={'required':'Required field'})
        building = forms.CharField(widget=forms.TextInput(), label="Building Name", required=True, error_messages={'required':'Required field'})
        floor = forms.CharField(widget=forms.TextInput(), label="Floor Number", required=True, error_messages={'required':'Required field'})
        room_number = forms.CharField(widget=forms.TextInput(), label="Room Number (optional)", required=False)
        description = forms.CharField(widget=forms.Textarea(attrs={'rows': 5}), label="Description of Space", required=True, error_messages={'required':'Required field'})
        justification = forms.CharField(widget=forms.Textarea(attrs={'rows': 5}), label="Why do you recommend this space? (optional)", required=False)
        email_confirmation = forms.CharField(required=False)
