from django.db import models
from django.utils.translation import ugettext_lazy as _


class Article(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField(_(u'url'))
    songs = models.ManyToManyField('Song', verbose_name=_(u'songs'), through='ArticleSong')

    class Meta:
        verbose_name = _('Article')
        verbose_name_plural = _('Articles')

    def __unicode__(self):
        pass


class Song(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField(_(u'url'))

    class Meta:
        verbose_name = _('Song')
        verbose_name_plural = _('Songs')

    def __unicode__(self):
        pass


class ArticleSong(models.Model):
    song = models.ForeignKey('Song')
    article = models.ForeignKey('Article')
    times_tagged = models.IntegerField(default=0)

    class Meta:
        verbose_name = _('ArticleSong')
        verbose_name_plural = _('ArticleSongs')
        ordering = ('times_tagged',)

    def __unicode__(self):
        pass
