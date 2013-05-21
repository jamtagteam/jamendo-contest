from __future__ import absolute_import
from django.views.generic import TemplateView


class HomeView(TemplateView):
    template_name = 'index.html'

index = HomeView.as_view()
