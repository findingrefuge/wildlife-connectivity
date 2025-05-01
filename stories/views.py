from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from .models import Story
from .forms import StoryForm
import json
from django.utils import timezone

def map_view(request):
    form = StoryForm()
    recent_stories = Story.objects.all().order_by('-date')  # Fetch all stories and order by newest at the top
    return render(request, 'map.html', {'form': form, 'recent_stories': recent_stories})

def get_stories(request):
    stories = Story.objects.all().values('id', 'name', 'date', 'latitude', 'longitude', 'background', 'story')
    return JsonResponse(list(stories), safe=False)

@csrf_exempt  # JS will send CSRF token
def add_story(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = StoryForm(data)
        if form.is_valid():
            story = form.save(commit=False)
            story.latitude = data['latitude']
            story.longitude = data['longitude']
            story.date = timezone.now()
            story.save()
            return JsonResponse({
                'success': True,
                'story': {
                    'id': story.id,
                    'name': story.name,
                    'date': story.date,
                    'indicator': story.indicator,
                    'latitude': story.latitude,
                    'longitude': story.longitude,
                    'background': story.background,
                    'story': story.story
                }
            })
        else:
            print('FORM ERRORS:', form.errors)
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)  # Return errors if invalid
    return HttpResponseBadRequest()