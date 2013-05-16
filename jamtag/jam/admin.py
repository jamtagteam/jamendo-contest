from __future__ import absolute_import
from django.contrib import admin
from .models import Content, Track, ContentTrack, TagInfo, URL


admin.site.register(Content)
admin.site.register(Track)
admin.site.register(ContentTrack)
admin.site.register(TagInfo)
admin.site.register(URL)
