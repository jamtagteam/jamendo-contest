# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Track.album_name'
        db.add_column(u'jam_track', 'album_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=255),
                      keep_default=False)

        # Adding field 'Track.album_image'
        db.add_column(u'jam_track', 'album_image',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=255),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Track.album_name'
        db.delete_column(u'jam_track', 'album_name')

        # Deleting field 'Track.album_image'
        db.delete_column(u'jam_track', 'album_image')


    models = {
        u'jam.content': {
            'Meta': {'object_name': 'Content'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'tracks': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['jam.Track']", 'through': u"orm['jam.ContentTrack']", 'symmetrical': 'False'})
        },
        u'jam.contenttrack': {
            'Meta': {'ordering': "('times_tagged',)", 'object_name': 'ContentTrack'},
            'content': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['jam.Content']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'times_tagged': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'track': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['jam.Track']"})
        },
        u'jam.taginfo': {
            'Meta': {'object_name': 'TagInfo'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_confirmed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_tagged': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['jam.ContentTrack']"}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'})
        },
        u'jam.track': {
            'Meta': {'object_name': 'Track'},
            'album_image': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'album_name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'artist_name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'audio': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'id': ('django.db.models.fields.IntegerField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        u'jam.url': {
            'Meta': {'object_name': 'URL'},
            'content': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['jam.Content']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'unique': 'True', 'max_length': '200', 'db_index': 'True'})
        }
    }

    complete_apps = ['jam']