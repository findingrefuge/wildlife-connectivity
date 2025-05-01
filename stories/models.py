from django.db import models

class Story(models.Model):
    name = models.CharField(max_length=100)
    date = models.DateTimeField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    background = models.CharField(max_length=255)
    story = models.TextField()
    indicator = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.latitude}, {self.longitude})"
