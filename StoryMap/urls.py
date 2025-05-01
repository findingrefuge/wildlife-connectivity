from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('stories.urls')),  # Include the app-level URLs for the stories app
]