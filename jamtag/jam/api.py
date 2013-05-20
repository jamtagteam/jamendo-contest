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

    def obj_create(self, bundle, request=None, **kwargs):
        content = Content.objects.create(title=request.GET.get('title'))
        track = Track.objects.get_or_create(
            id=request.GET.get('id'),
            name=request.GET.get('name'),
            artist_name=request.GET.get('artist_name'),
            audio=request.GET.get('audio')
        )
        ct = ContentTrack.objects.create(track=track, content=content)
        TagInfo.objects.create(tag=ct, is_tagged=True, is_confirmed=False, user=request.GET.get('user'))
        return super(URLResource, self).obj_create(bundle, request, content=content)


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
    track = fields.ForeignKey(TrackResource, 'tracks', full=True, null=True, related_name='tracks')
    content = fields.ForeignKey('jam.api.ContentResource', 'content', full=True, null=True)

    class Meta:
        queryset = ContentTrack.objects.all()
        allowed_methods = ('get', 'post')
        resource_name = 'tag'                   # nemam pojma da li vam odgovara ovo ime za resur, vidio sam da ga je Vanja imenovao tako u TagInfo
        include_resource_uri = False
        authorization = Authorization()
        authentication = Authentication()
        cache = SimpleCache()
        always_return_data = True

    def obj_create(self, bundle, request=None, **kwargs):
        if request.GET.get('confirm_tag'):
            content = Content.objects.get(title=request.GET.get('title'))
            track = Track.objects.get(id=request.GET.get('id'))
            ct = ContentTrack.objects.filter(content=content, track=track)
            ct.update(times_tagged=F('times_tagged')+1)                         # nasao na stackoverflowu i docsima F za update uvecanje vrijednosti cini se zgodno, ako je krivo sorry
            ct.save()
            return super(ContentTrackResource, self).obj_create(bundle, request, ct=ct)  # ovo je vjerojatno krivo ali cete mi morat objasnit zasto se gore vracao content i sto bi se ovdje trebalo vratiti :)
