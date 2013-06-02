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
            var clid = 'b6747d04'   // client id for read api testing provided by jamendo
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



    var URLs = can.Control({
        init: function(element, options) {
            var self = this;
            URL.findAll(
                {location: location},
                function (urls) {
                    // what happens when there are no tracks
                    console.log(urls)
                    if (urls.length !== 0){
                        var playlist = []
                        $.each($(urls).attr('content').tracks, function(i, track){
                            var song = {
                                title: track.name,
                                //oga: track.audio,
                                mp3: track.audio,
                            }
                            playlist.push(song);
                        })
                        new jPlayerPlaylist({
                            jPlayer: "#jquery_jplayer_1",
                            cssSelectorAncestor: "#jp_container_1"
                        }, playlist, {
                            swfPath: api.static + "js/lib/jPlayer",
                            supplied: "mp3",
                            wmode: "window",
                            smoothPlayBar: true,
                            keyEnabled: true
                        });
                    }
                    else{
                        var playlist = []
                        var msg = {
                            title: 'Please tag this adress!',
                            mp3: null,
                        }
                        playlist.push(msg);
                        new jPlayerPlaylist({
                            jPlayer: "#jquery_jplayer_1",
                            cssSelectorAncestor: "#jp_container_1"
                        }, playlist, {
                            swfPath: api.static + "js/lib/jPlayer",
                            supplied: "mp3",
                            wmode: "window",
                            smoothPlayBar: true,
                            keyEnabled: true
                        });
                    }
                }
            );
            this.on($(document), '.jam-search', 'keyup', 'searchJamendo'); //bilo bi fora da se popunjava bez search btna
            this.on($(document), '.track-url', 'click', 'loadSong');
            this.on($(document), '#confirm', 'click', 'confirmTag');
            this.on($(document), '#tag-existing', 'click', 'tagExisting');
            this.on($(document), '#tag-new', 'click', 'tagNew');
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
                            $('#result-list').append('<li class="song"><p class="track-info"><img src="'+track.album_image+'" /><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="album">Album: '+track.album_name+'</span><br /><span class="track"><a href="'+track.audio+'" class="track-url" id="'+track.id+'">Song:'+track.name+'</a></span></p></li>');
                        });
                    }
                );
            }
        },
        loadSong: function(el, ev){
            ev.preventDefault();
            // add to playlist
            /*
            jPlayerPlaylist.add({
                title: $(el).html(),
                mp3: $(el).attr('href')
            });
            */
            console.log(jPlayer.jPlayerPlaylist.add());
        },
        confirmTag: function(el, ev) {
            ev.preventDefault();
            // URL.createTagInfo
        },
        tagExisting: function(el, ev) {
            ev.preventDefault();
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
