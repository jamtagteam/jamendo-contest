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
            );
            this.on($(document), '#search', 'click', 'searchJamendo');
            this.on($(document), '#confirm', 'click', 'confirmTag');
            this.on($(document), '#tag-existing', 'click', 'tagExisting');
            this.on($(document), '#tag-new', 'click', 'tagNew');
        },
        searchJamendo: function(el, ev) {
            ev.preventDefault();
            if ($('#search-input').val()){
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
