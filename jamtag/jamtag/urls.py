from django.conf.urls import patterns, include, url

from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf import settings
from django.conf.urls.static import static

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
    url(r'^$', 'jam.views.index', name='index'),
)
urlpatterns += staticfiles_urlpatterns() + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
