from __future__ import absolute_import
from django.views.generic import TemplateView
from .models import Track, URL


class HomeView(TemplateView):
    template_name = 'base.html'

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        context['pages'] = URL.objects.count()
        context['tracks'] = Track.objects.count()
        context['urlselect'] = URL.objects.all()

        try:
            context['tracks_avg'] = context['tracks'] / context['pages']
        except ZeroDivisionError:
            context['tracks_avg'] = 0
        return context

index = HomeView.as_view()
