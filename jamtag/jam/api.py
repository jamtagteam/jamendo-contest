from __future__ import absolute_import
from tastypie.resources import ModelResource
from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.authentication import Authentication
from django.db.models import F
from .models import Content, Track, ContentTrack, URL, TagInfo
from tastypie.cache import SimpleCache


class TrackResource(ModelResource):
    class Meta:
        queryset = Track.objects.all()
        allowed_methods = ('get', 'post')
        resource_name = 'track'
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = True


class URLResource(ModelResource):
    content = fields.ForeignKey('jam.api.ContentResource', 'content', full=True, null=True)

    class Meta:
        queryset = URL.objects.all()
        allowed_methods = ('get', 'post')
        resource_name = 'url'
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = True
        filtering = {
            'url': ('exact',),
        }

    def obj_create(self, bundle, **kwargs):
        content = Content.objects.create(title=bundle.request.GET.get('title'))
        track = Track.objects.get_or_create(
            id=int(bundle.request.GET.get('track_id')),
            name=bundle.request.GET.get('name'),
            artist_name=bundle.request.GET.get('artist_name'),
            audio=bundle.request.GET.get('audio')
        )
        ct = ContentTrack.objects.create(track=track[0], content=content)
        TagInfo.objects.create(tag=ct, is_tagged=True, is_confirmed=False, user=bundle.request.GET.get('user', u''))
        return super(URLResource, self).obj_create(bundle, content=content)


class ContentResource(ModelResource):
    tracks = fields.ManyToManyField(TrackResource, 'tracks', full=True, null=True, related_name='tracks')

    class Meta:
        queryset = Content.objects.all()
        allowed_methods = ('get',)
        resource_name = 'content'
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = True


class ContentTrackResource(ModelResource):
    track = fields.ForeignKey(TrackResource, 'track', full=True, null=True, related_name='track')
    content = fields.ForeignKey(ContentResource, 'content', full=True, null=True, related_name='content')

    class Meta:
        queryset = ContentTrack.objects.all()
        allowed_methods = ('get', 'post')
        resource_name = 'tag'
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = True

    def obj_create(self, bundle, **kwargs):
        track = Track.objects.get_or_create(
            id=int(bundle.request.GET.get('track_id')),
            name=bundle.request.GET.get('name'),
            artist_name=bundle.request.GET.get('artist_name'),
            audio=bundle.request.GET.get('audio')
        )
        bundle = super(ContentTrackResource, self).obj_create(bundle, track=track[0])
        TagInfo.objects.create(
            tag=bundle.obj,
            is_tagged=True,
            is_confirmed=False,
            user=bundle.request.GET.get('user', u'')
        )
        return bundle


class TagInfoResource(ModelResource):
    tag = fields.ForeignKey(ContentTrackResource, 'tag', full=True)

    class Meta:
        queryset = TagInfo.objects.all()
        allowed_methods = ('get', 'post',)
        resource_name = 'taginfo'
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = True

    def obj_create(self, bundle, **kwargs):
        print int(bundle.request.GET.get('id'))
        ct = ContentTrack.objects.select_for_update().get(id=int(bundle.request.GET.get('id')))
        ct.times_tagged += 1
        ct.save()
        return super(TagInfoResource, self).obj_create(bundle, tag=ct)
