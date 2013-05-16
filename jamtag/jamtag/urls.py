from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

from tastypie.api import Api
api = Api(api_name='v1')

from jam.api import ContentResource
from jam.api import TrackResource
api.register(ContentResource())
api.register(TrackResource())

urlpatterns = patterns('',
    url(r'^api/', include(api.urls)),
    url(r'^admin/', include(admin.site.urls)),
)
