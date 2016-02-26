""" Copyright 2014 UW Information Technology, University of Washington

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


class BaseForm(forms.Form):
    def full_clean(self):
        str_type = type("")
        unicode_type = type(u"")

        data = self.data.copy()
        for k, v in data.items():
            if (type(v) == str_type) or type(v) == unicode_type:
                data[k] = v.strip()
        self.data = data
        super(BaseForm, self).full_clean()

