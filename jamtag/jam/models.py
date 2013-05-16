from django.db import models
from django.utils.translation import ugettext_lazy as _


class Content(models.Model):
    title = models.CharField(_(u'content title'), max_length=255)
    tracks = models.ManyToManyField('Track', verbose_name=_(u'track'), through='ContentTrack')

    class Meta:
        verbose_name = _('Content')
        verbose_name_plural = _('Content units')

    def __unicode__(self):
        return self.title


class Track(models.Model):
    id = models.IntegerField(_(u'Jamendo track ID'), primary_key=True)
    name = models.CharField(_(u'Jamendo track name'), max_length=255)
    artist_name = models.CharField(_(u'Jamendo artist name'), max_length=255)
    audio = models.URLField(_(u'link to track'))

    class Meta:
        verbose_name = _('Track')
        verbose_name_plural = _('Tracks')

    def __unicode__(self):
        return self.name


class ContentTrack(models.Model):
    track = models.ForeignKey('Track')
    content = models.ForeignKey('Content')
    times_tagged = models.IntegerField(default=1)  # postaje redundantno ali mozemo zadrzati radi orderinga

    class Meta:
        verbose_name = _('Tagged content')
        verbose_name_plural = _('Tagged content units')
        ordering = ('times_tagged',)

    def __unicode__(self):
        return '{}-{}'.format(self.content, self.track)


class TagInfo(models.Model):
    user = models.CharField(max_length=50, blank=True)  # username Jamendo usera ili neki drugi identifikator
    tag = models.ForeignKey('ContentTrack')
    timestamp = models.DateTimeField()
    is_tagged = models.BooleanField()
    is_confirmed = models.BooleanField()

    class Meta:
        verbose_name = _('Tag information')
        verbose_name_plural = _('Tag information')

    def __unicode__(self):
        return 'Tagged by {} with {}'.format(self.user, self.tag)


class URL(models.Model):
    url = models.URLField(_(u'URL'), db_index=True)
    content = models.ForeignKey('Content')

    class Meta:
        verbose_name = _('URL')
        verbose_name_plural = _('URLs')

    def __unicode__(self):
        return self.url
