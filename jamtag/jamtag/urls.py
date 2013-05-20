from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

from tastypie.api import Api
api = Api(api_name='v1')

from jam.api import TagInfoResource, ContentTrackResource, URLResource, ContentResource
api.register(TagInfoResource())
api.register(ContentTrackResource())
api.register(URLResource())
api.register(ContentResource())

urlpatterns = patterns('',
    url(r'^api/', include(api.urls)),
    url(r'^admin/', include(admin.site.urls)),
)
