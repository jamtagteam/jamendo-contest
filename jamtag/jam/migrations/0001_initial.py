# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Content'
        db.create_table(u'jam_content', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255)),
        ))
        db.send_create_signal(u'jam', ['Content'])

        # Adding model 'Track'
        db.create_table(u'jam_track', (
            ('id', self.gf('django.db.models.fields.IntegerField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('artist_name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('audio', self.gf('django.db.models.fields.URLField')(max_length=200)),
        ))
        db.send_create_signal(u'jam', ['Track'])

        # Adding model 'ContentTrack'
        db.create_table(u'jam_contenttrack', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('track', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['jam.Track'])),
            ('content', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['jam.Content'])),
            ('times_tagged', self.gf('django.db.models.fields.IntegerField')(default=1)),
        ))
        db.send_create_signal(u'jam', ['ContentTrack'])

        # Adding model 'TagInfo'
        db.create_table(u'jam_taginfo', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.CharField')(max_length=50, blank=True)),
            ('tag', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['jam.ContentTrack'])),
            ('timestamp', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('is_tagged', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('is_confirmed', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'jam', ['TagInfo'])

        # Adding model 'URL'
        db.create_table(u'jam_url', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('url', self.gf('django.db.models.fields.URLField')(unique=True, max_length=200, db_index=True)),
            ('content', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['jam.Content'])),
        ))
        db.send_create_signal(u'jam', ['URL'])


    def backwards(self, orm):
        # Deleting model 'Content'
        db.delete_table(u'jam_content')

        # Deleting model 'Track'
        db.delete_table(u'jam_track')

        # Deleting model 'ContentTrack'
        db.delete_table(u'jam_contenttrack')

        # Deleting model 'TagInfo'
        db.delete_table(u'jam_taginfo')

        # Deleting model 'URL'
        db.delete_table(u'jam_url')


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