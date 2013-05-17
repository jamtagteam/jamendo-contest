from __future__ import absolute_import
from tastypie.resources import ModelResource
from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.authentication import Authentication
from .models import Content, Track, URL, TagInfo
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
    class Meta:
        queryset = URL.objects.all()
        allowed_methods = ('get', 'post')
        resource_name = 'url'
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = True


class ContentResource(ModelResource):
    tracks = fields.ManyToManyField(TrackResource, 'tracks', full=True, null=True, related_name='tracks')
    url = fields.OneToManyField(URLResource, 'url_set', full=True, null=True, related_name='content')

    class Meta:
        queryset = Content.objects.all()
        allowed_methods = ('get', 'post')
        resource_name = 'content'
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = True
