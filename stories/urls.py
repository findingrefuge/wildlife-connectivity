from django.urls import path
from . import views

urlpatterns = [
    path('', views.map_view, name='home'),  # Change 'map' to 'home' for clarity
    path('api/stories/', views.get_stories, name='get_stories'),
    path('api/add/', views.add_story, name='add_story'),
]