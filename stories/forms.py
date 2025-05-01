from django import forms
from .models import Story

INDICATOR_CHOICES = [
    ('indicator1', 'Indicator 1'),
    ('indicator2', 'Indicator 2'),
    ('indicator3', 'Indicator 3'),
    # Add more as needed
]

class StoryForm(forms.ModelForm):
    indicator = forms.ChoiceField(choices=INDICATOR_CHOICES, label='Indicator')

    class Meta:
        model = Story
        fields = ['name', 'background', 'story', 'indicator']
        widgets = {
            'story': forms.Textarea(attrs={'rows': 4, 'cols': 40}),
        }
