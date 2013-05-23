'use strict'

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

    var URLs = can.Control({
        init: function(element, options) {
            var self = this;
            URL.findAll(
                {location: location},
                function (urls) {
                    // what happens when there are no tracks
                    console.log(urls)
                    if (urls == []){
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
            this.on($(document), '#confirm', 'click', 'confirmTag');
            this.on($(document), '#tag-existing', 'click', 'tagExisting');
            this.on($(document), '#tag-new', 'click', 'tagNew');
        },
        searchJamendo: function(el, ev) {
            ev.preventDefault();
            if ($('.jam-search').val()){
// ja bi koristio http://developer.jamendo.com/v3.0/autocomplete ovo za querijanje!!!
                url = 'http://api.jamendo.com/v3.0/autocomplete/'
                client = 'b6747d04'   // client id for read api testing provided by jamendo
                format = 'jsonpretty'
                limit = 3
                prefix = $('.jam-search').val()
                matchcount = 1

                // TODO: query jamendo and display results
            }
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
