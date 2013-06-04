'use strict'
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number]: match;
            }
        );
    };
}

//'{0} says {1}'.format('Chubz', 'hello');

var cssSelector = {jPlayer: "#jquery_jplayer_1", cssSelectorAncestor: "#jp_container_1"};
var playlist = [];
var options = {swfPath: api.static + "js/lib/jPlayer", supplied: "mp3", wmode: "window", smoothPlayBar: true, keyEnabled: true};
var jamList = new jPlayerPlaylist(cssSelector, playlist, options);
jamList.option("enableRemoveControls", true);

var trackingTracks = []; //variable for tracking all track info that we have in our or jamendos api, should be indexed like players playlist

$(function() {
    var URL = can.Model({
        //findAll : 'GET /api/v1/url/' + api.format,
        findOne : 'GET /api/v1/url/{id}/' + api.format,
        //create : 'POST /api/v1/url/' + api.format,
        //update : 'PUT /api/v1/url/{id}/' + api.format,
        //destroy : 'DELETE /api/v1/url/{id}/' + api.format,
        models: function(data) {
            return data.objects;
        },
        findAll: function(params){
            var url = '';
            if (params.location) {
                url = params.location;
            }
            return $.ajax({
                url: '/api/v1/url/' + api.format + '&url=' + url,
                type: 'get',
                dataType: 'json',
            });
        },
        create: function(params){
            var data = JSON.stringify({
                title: params.title,
                track_id: params.id,
                name: params.name,
                artist_name: params.artist_name,
                audio: params.audio,
            });
            return $.ajax({
                url: '/api/v1/url/',
                type: 'POST',
                dcontentType: 'application/json',
                data: data,
                dataType: 'json',
                processData: false
            });
        }
    },{});

    var jamendo = can.Model({
        //findAll : 'GET http://api.jamendo.com/v3.0/autocomplete/?',
        //findOne : 'GET /nesto/nesto',
        //create : 'POST /nesto/nesto',
        //update : 'PUT /nesto/nesto',
        //destroy : 'DELETE /nesto/nesto',
        models: function(data){
            return data.results;
        },
        findAll: function(params){
            var clid = '62d2eee4'   // client id for read api testing provided by jamendo for me!
            var frmt = 'jsonpretty'
            var lmt = 6
            var grpby = 'artist_id'
            var incld = 'licenses+musicinfo+stats'
            var srch = params.srch;
            var img = 50
            return $.ajax({
                url: 'http://api.jamendo.com/v3.0/tracks/?client_id={0}&format={1}&limit={2}&include={3}&search={4}&groupby={5}&imagesize={6}'.format(clid,frmt,lmt,incld,srch,grpby,img),
                type: 'get',
                dataType: 'json',
            });
            /*
            Prepraviti da testira Headere na određene codove, jer inače se api koristi direktno a ipak trebamo proc i nekakvu validaciju
            */
        }
    },{});

    var tagInfo = can.Model({
        models: function(data){
            return data.objects;
        },
        create: function(params){
            var data = JSON.stringify({
                user: 'unibrow',
                tag: params.ct_id,  // this should be ContentTrack id, needed by our api for updating the counter in create
                is_tagged: false,
                is_confirmed: true,
            });
            return $.ajax({
                url: '/api/v1/taginfo/',
                type: 'POST',
                contentType: 'application/json',
                data: data,
                dataType: 'json',
                processData: false
            });
            return null;
        }
    }, {});

    var contentTrack = can.Model({
        models: function(data){
            return data.objects;
        },
        findOne: function(params){
            return null;
        },
        create: function(params){
            var track_id = parseInt(params.track_id);
            var name = params.name;
            var artist_name = params.artist_name;
            var audio = params.audio;
            var data = JSON.stringify({
                track_id: parseInt(params.track_id),
                name: params.name,
                artist_name: params.artist_name,
                audio: params.audio,
            })
            return $.ajax({
                url: '/api/v1/tag/?track_id={0}&name={1}&artist_name={2}&audio={3}'.format(track_id,name,artist_name,audio),
                type: 'POST',
                contentType: 'application/json',
                data: data,
                dataType: 'json',
            });
        }
    }, {});

    var URLs = can.Control({
        init: function(element, options) {
            var self = this;
            URL.findAll(
                {location: location},
                function (urls) {
                    // what happens when there are no tracks
                    console.log(urls)
                    if (urls.length !== 0){
                        $.each($(urls).attr('content').tracks, function(i, track){
                            var song = {
                                title: track.name,
                                //oga: track.audio,
                                mp3: track.audio,
                            }
                            jamList.add(song);
                            trackingTracks.push(track);
                            $('#tag-button').addClass('tag-existing');
                        })
                    }
                    else{
                        var msg = {
                            title: 'Please tag this adress!',
                            mp3: null,
                        }
                        $('#tag-button').addClass('tag-new');
                        jamList.add(msg);
                    }
                }
            );
            this.on($(document), '.jam-search', 'keyup', 'searchJamendo'); //bilo bi fora da se popunjava bez search btna
            this.on($(document), '.track-url', 'click', 'loadSong');
            this.on($(document), '#confirm', 'click', 'confirmTag');
            this.on($(document), '.tag-existing', 'click', 'tagExisting');
            this.on($(document), '.tag-new', 'click', 'tagNew');
        },
        searchJamendo: function(el, ev) {
            ev.preventDefault();
            if ($('.jam-search').val()){

                // TODO  remove api info from variables and include them via some conf file
                var srch = $('.jam-search').val()
                jamendo.findAll(
                    {srch: srch},
                    function(results){
                        $('#result-list').empty();
                        console.log(results)  // to see complete results
                        console.log($(results).attr('name'));

                        $.each($(results), function(i, track){
                            $('#result-list').append('<li class="song"><p class="track-info"><img src="'+track.album_image+'" /><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="album">Album: '+track.album_name+'</span><br /><span class="track"><a href="'+track.audio+'" class="track-url" data-song-name="'+track.name+'" data-song-id="'+track.id+'" data-artist-name="'+track.artist_name+'">Song:'+track.name+'</a></span></p></li>');
                        });
                    }
                );
            }
        },
        loadSong: function(el, ev){
            ev.preventDefault();
            var track = {
                track_id: $(el).attr('data-song-id'),
                name: $(el).attr('data-song-name'),
                artist_name: $(el).attr('data-artist-name'),
                audio: $(el).attr('href')
            }
            jamList.add({
                title: $(el).attr('data-song-name'),
                mp3: $(el).attr('href')
            }, true);
            trackingTracks.push(track);
        },
        confirmTag: function(el, ev) {
            ev.preventDefault();
            console.log(jamList.current);
            console.log(jamList.playlist[jamList.current]);

        },
        tagExisting: function(el, ev) {
            ev.preventDefault();
            var tagTrack = trackingTracks[jamList.current]
            var tag = new contentTrack(tagTrack);
            tag.save()
            // URL.createContentTrack
        },
        tagNew: function(el, ev) {
            ev.preventDefault();
            // URL.create

        }
    });
    var location = window.location.href;
    var urlsControl = new URLs('#tracks', {});
});
