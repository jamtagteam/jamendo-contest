from __future__ import absolute_import
from tastypie.resources import ModelResource, Resource
from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.authentication import Authentication
from .models import Content, Track, ContentTrack, URL, TagInfo
from tastypie.cache import SimpleCache
from django.http import HttpResponse
from tastypie.exceptions import ImmediateHttpResponse
from tastypie import http


class BaseCorsResource(object):
    """
Adds CORS headers to resources that subclass this.
"""
    allowed_headers = ['Content-Type', 'Authorization']

    def create_response(self, *args, **kwargs):
        response = super(BaseCorsResource, self).create_response(*args, **kwargs)
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Headers'] = \
            ",".join(self.allowed_headers)
        return response

    def method_check(self, request, allowed=None):
        if allowed is None:
            allowed = []
            allowed = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']

        request_method = request.method.lower()
        allows = ','.join(map(str.upper, allowed))

        if request_method == 'options':
            response = HttpResponse(allows)
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Headers'] = \
                ",".join(self.allowed_headers)
            response['Access-Control-Allow-Methods'] = allows
            raise ImmediateHttpResponse(response=response)

        if not request_method in allowed:
            response = http.HttpMethodNotAllowed(allows)
            response['Allow'] = allows
            raise ImmediateHttpResponse(response=response)

        return request_method


class TrackResource(BaseCorsResource, ModelResource):
    class Meta:
        queryset = Track.objects.all()
        allowed_methods = ('get', 'post', 'options')
        resource_name = 'track'
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = True


class URLResource(BaseCorsResource, ModelResource):
    content = fields.ForeignKey('jam.api.ContentResource', 'content', full=True, null=True)

    class Meta:
        queryset = URL.objects.all()
        allowed_methods = ('get', 'post', 'options')
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


class ContentResource(BaseCorsResource, ModelResource):
    #tracks = fields.ManyToManyField(TrackResource, 'tracks', full=True, null=True, related_name='tracks')
    tracks = fields.ManyToManyField('jam.api.ContentTrackResource', attribute=lambda bundle: bundle.obj.tracks.through.objects.filter(content=bundle.obj) or bundle.obj.tracks, full=True)

    class Meta:
        queryset = Content.objects.all()
        allowed_methods = ('get', 'options')
        resource_name = 'content'
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = True


class ContentTrackResource(BaseCorsResource, ModelResource):
    track = fields.ForeignKey(TrackResource, 'track', full=True, null=True, related_name='track')
    #content = fields.ForeignKey(ContentResource, 'content', full=True, null=True, related_name='content')

    class Meta:
        queryset = ContentTrack.objects.all()
        allowed_methods = ('get', 'post', 'options')
        resource_name = 'tag'
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = False

    def obj_create(self, bundle, **kwargs):
        track = Track.objects.get_or_create(
            id=bundle.request.GET.get('track_id'),
            name=bundle.request.GET.get('name'),
            artist_name=bundle.request.GET.get('artist_name'),
            audio=bundle.request.GET.get('audio')
        )
        content = Content.objects.get(id=int(bundle.request.GET.get('content_resource')))
        bundle = super(ContentTrackResource, self).obj_create(bundle, track=track[0], content=content)
        TagInfo.objects.create(
            tag=bundle.obj,
            is_tagged=True,
            is_confirmed=False,
            user=bundle.request.GET.get('user', u'')
        )
        return bundle


class TagInfoResource(BaseCorsResource, ModelResource):
    tag = fields.ForeignKey(ContentTrackResource, 'tag', full=True, null=True)

    class Meta:
        queryset = TagInfo.objects.all()
        allowed_methods = ('get', 'post', 'options')
        resource_name = 'taginfo'
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = True

    def obj_create(self, bundle, **kwargs):
        ct = ContentTrack.objects.select_for_update().get(id=int(bundle.request.GET.get('id')))
        ct.times_tagged += 1
        ct.save()
        return super(TagInfoResource, self).obj_create(bundle, tag=ct)
