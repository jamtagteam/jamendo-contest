from __future__ import absolute_import
from django.contrib import admin
from .models import Content, Track, ContentTrack, TagInfo, URL


class ContentTrackInline(admin.StackedInline):
    model = ContentTrack
    extra = 1


class ContentAdmin(admin.ModelAdmin):
    inlines = (ContentTrackInline,)


class TrackAdmin(admin.ModelAdmin):
    inlines = (ContentTrackInline,)


admin.site.register(Content, ContentAdmin)
admin.site.register(Track, TrackAdmin)
admin.site.register(TagInfo)
admin.site.register(URL)
