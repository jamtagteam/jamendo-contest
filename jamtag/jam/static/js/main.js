'use strict'
// string formatting
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

// initial setup
var cssSelector = {jPlayer: "#jquery_jplayer_1", cssSelectorAncestor: "#jp_container_1"};
var playlist = [];
var options = {swfPath: api.static + "js/lib/jPlayer", supplied: "mp3", wmode: "window", smoothPlayBar: true, keyEnabled: true};
var jamList = new jPlayerPlaylist(cssSelector, playlist, options);
jamList.option("enableRemoveControls", true);

var trackingTracks = []; //variable for tracking all track info that we have in our or jamendos api, should be indexed like players playlist


// delay function
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

$(function() {
// MODELS
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
            var getData = $.param({
                title: window.document.title,
                user: 'unibrow',
                track_id: params.track_id,
                name: params.name,
                artist_name: params.artist_name,
                audio: params.audio,
            });
            var postData = JSON.stringify({'url': location});
            return $.ajax({
                url: '/api/v1/url/' + api.format + getData,
                type: 'POST',
                contentType: 'application/json',
                data: postData,
                dataType: 'json',
                async: false
            });
        }
    },{});

    var jamendo

    var jamendo = can.Model({
        //findAll : 'GET http://api.jamendo.com/v3.0/autocomplete/?',
        //findOne : 'GET /nesto/nesto',
        //create : 'POST /nesto/nesto',
        //update : 'PUT /nesto/nesto',
        //destroy : 'DELETE /nesto/nesto',
        models: function(data){
            return data;
        },
        findAll: function(params){
            // client id for read api testing provided by jamendo for me!
            var clid = '62d2eee4',
                frmt = 'jsonpretty',
                lmt = 6,
                grpby = 'artist_id',
                incld = 'licenses+musicinfo+stats',
                srch = params.srch,
                img = 50;
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
            console.log(params);
            var getData = $.param({id: params.id});
            var postData = JSON.stringify({is_tagged: false, is_confirmed: true, user: 'unibrow'});
            return $.ajax({
                url: '/api/v1/taginfo/' + api.format + getData,
                type: 'POST',
                contentType: 'application/json',
                data: postData,
                dataType: 'json',
                async: false
            });
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
            var getData = $.param({
                track_id: params.track_id,
                name: params.name,
                artist_name: params.artist_name,
                audio: params.audio,
            });
            var postData = JSON.stringify({content: api.resource});
            return $.ajax({
                url: '/api/v1/tag/' + api.format + getData,
                type: 'POST',
                data: postData,
                dataType: 'json',
                contentType: 'application/json',
                async: false
            });
        }
    }, {});
// CONTROLLERS
    var URLs = can.Control({
        init: function(element, options) {
            var self = this;
            URL.findAll(
                {location: location},
                function (urls) {
                    // what happens when there are no tracks
                    if (urls.length !== 0){
                        $.each($(urls).attr('content').tracks, function(i, track){
                            var song = {
                                title: track.track.name,
                                //oga: track.audio,
                                mp3: track.track.audio,
                            }
                            jamList.add(song);
                            trackingTracks.push(track);
                            $('#tag-button').addClass('tag-existing');
                        });
                        $.each(urls, function(i,v){
                            api.resource = '/api/v1/content/' + v.content.id + '/';
                        });
                    }
                    else{
                        var msg = {
                            title: 'Please tag this adress!',
                            mp3: null,
                        }
                        $('#tag-button').addClass('tag-new');
                        //jamList.add(msg);
                    }
                }
            );
            this.on($(document), '.jam-search', 'keyup', 'searchJamendo');
            this.on($(document), '.track-url', 'click', 'loadSong');
            this.on($(document), '#confirm', 'click', 'confirmTag');
            this.on($(document), '.tag-existing', 'click', 'tagExisting');
            this.on($(document), '.tag-new', 'click', 'tagNew');
        },
        searchJamendo: function(el, ev) {
            ev.preventDefault();
            delay(function(){
                if ($('.jam-search').val()){

                    // TODO  remove api info from variables and include them via some conf file
                    var srch = $('.jam-search').val()
                    jamendo.findAll(
                        {srch: srch},
                        function(data){
                            if(data.headers.code == 0){
                                $('#result-list').empty();
                                $.each($(data.results), function(i, track){
                                    $('#result-list').append('<li class="song"><p class="track-info"><img src="'+track.album_image+'" /><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="album">Album: '+track.album_name+'</span><br /><span class="track"><a href="'+track.audio+'" class="track-url" data-song-name="'+track.name+'" data-song-id="'+track.id+'" data-artist-name="'+track.artist_name+'">Song:'+track.name+'</a></span></p></li>');
                                });
                            }
                            else{
                                alert(data.headers.status+': with code '+data.headers.code+', '+data.headers.error_message+' '+data.headers.warnings);
                            }
                        }
                    );
                }
            }, 1000);
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
            tagInfo.create(trackingTracks[jamList.current]);
        },
        tagExisting: function(el, ev) {
            ev.preventDefault();
            var tag = new contentTrack(trackingTracks[jamList.current]);
            tag.save()
        },
        tagNew: function(el, ev) {
            ev.preventDefault();
            console.log(jamList.current);
            console.log(trackingTracks[jamList.current]);
            URL.create(trackingTracks[jamList.current]);
        }
    });
    var location = window.location.href;
    var urlsControl = new URLs('#tracks', {});
});
