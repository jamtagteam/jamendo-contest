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
var options = {swfPath: api.static + "js/lib/jPlayer", supplied: "oga", wmode: "window", smoothPlayBar: true, keyEnabled: true};
var jamList = new jPlayerPlaylist(cssSelector, playlist, options);
jamList.option("enableRemoveControls", true);
jamList.option

var trackingTracks = []; //variable for tracking all track info that we have in our or jamendos api, should be indexed like players playlist
var isURLtagged;
var dlocation;
var doctitle;

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
        findOne : 'GET http://jamtag.offsetlab.net/api/v1/url/{id}/' + api.format,
        //create : 'POST /api/v1/url/' + api.format,
        //update : 'PUT /api/v1/url/{id}/' + api.format,
        //destroy : 'DELETE /api/v1/url/{id}/' + api.format,
        models: function(data) {
            return data.objects;
        },
        findAll: function(params) {
            var getData = $.param(params);
            return $.ajax({
                url: 'http://jamtag.offsetlab.net/api/v1/url/' + api.format + getData,
                type: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                async: false,
                crossDomain: true
            });
        },
        create: function(params){
            var getData = $.param({
                title: doctitle,
                user: 'unibrow',
                track_id: params.track_id,
                name: params.name,
                artist_name: params.artist_name,
                audio: params.audio,
                album_image: params.album_image,
                album_name: params.album_name
            });
            var postData = JSON.stringify({url: dlocation});
            return $.ajax({
                url: 'http://jamtag.offsetlab.net/api/v1/url/' + api.format + getData,
                type: 'POST',
                contentType: 'application/json',
                data: postData,
                dataType: 'json',
                async: false,
                crossDomain: true
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
            return data;
        },
        findAll: function(params){
            // client id for read api testing provided by jamendo for me!
            var clid = '62d2eee4',
                frmt = 'jsonpretty',
                lmt = 6,
                grpby = 'artist_id',
                audiofrmt = 'ogg',
                incld = 'licenses+musicinfo+stats',
                srch = params.srch,
                img = 50;
            return $.ajax({
                url: 'http://api.jamendo.com/v3.0/tracks/?client_id={0}&format={1}&limit={2}&audioformat={3}&include={4}&search={5}&groupby={6}&imagesize={7}'.format(clid,frmt,lmt,audiofrmt,incld,srch,grpby,img),
                type: 'get',
                dataType: 'json',
                async: false
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
                url: 'http://jamtag.offsetlab.net/api/v1/taginfo/' + api.format + getData,
                type: 'POST',
                contentType: 'application/json',
                data: postData,
                dataType: 'json',
                async: false,
                crossDomain: true
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
                album_image: params.album_image,
                album_name: params.album_name,
                content_resource: api.resource
            });
            var postData = JSON.stringify({});
            return $.ajax({
                url: 'http://jamtag.offsetlab.net/api/v1/tag/' + api.format + getData,
                type: 'POST',
                data: postData,
                dataType: 'json',
                contentType: 'application/json',
                async: false,
                crossDomain: true
            });
        }
    }, {});
// CONTROLLERS
    var URLs = can.Control({
        init: function(element, options) {
            this.startPlayer(true);
            this.on($(document), '#pages', 'change', 'startPlayer');
            this.on($(document), '.jam-search', 'keyup', 'searchJamendo');
            this.on($(document), '.track-url', 'click', 'loadSong');
            this.on($(document), '.confirm', 'click', 'confirmTag');
            this.on($(document), '.retag', 'click', 'tagExisting');
            this.on($(document), '.tag', 'click', 'tagNew');
        },
        startPlayer: function(first){
            dlocation = $('select option:selected').val();
            doctitle = $('select option:selected').text();
            if(first === true){
                this.refreshList();
            }
            else{
                resetPlaylist();
                this.refreshList();
            }
            if(trackingTracks.length <= 1){
                setNowPlaying(trackingTracks[0]);
            }
        },
        refreshList: function() {
            URL.findAll(
                {url: dlocation},
                function (urls) {
                    // what happens when there are no tracks
                    if (urls.length !== 0) {
                        if (urls.length > 5)
                            urls = urls.slice(0, 5);
                        $.each($(urls).attr('content').tracks, function(i, track){
                            var ttl = '<span>'+track.track.artist_name+' - '+track.track.name+'</span>';
                            var song = {
                                title: ttl,
                                //oga: track.audio,
                                oga: track.track.audio,
                            }
                            if(trackingTracks[0] !== undefined){
                                if(trackingTracks[0].track_id != track.track.id && (trackingTracks[0].track === undefined  || trackingTracks[0].track.id != track.track.id)){
                                    jamList.add(song, false);
                                    trackingTracks.push(track);
                                    if(trackingTracks[0].times_tagged){
                                        trackingTracks[0].times_tagged = 0;
                                        setNowPlaying(trackingTracks[0]);
                                    }
                                    else{
                                        setNowPlaying(trackingTracks[0]);
                                    }
                                }
                                else{
                                    if(trackingTracks[0].times_tagged){
                                        trackingTracks[0].times_tagged = 0;
                                        setNowPlaying(trackingTracks[0]);
                                    }
                                    else{
                                        setNowPlaying(trackingTracks[0]);
                                    }
                                }
                            }
                            else{
                                jamList.add(song, true);
                                trackingTracks.push(track);
                                setNowPlaying(track);
                            }

                        });
                        $.each(urls, function(i,v){
                            api.resource = v.content.id;
                        });
                        isURLtagged = true;
                    } else {
                        var msg = {
                            title: 'Please tag this adress!',
                            mp3: null,
                        }
                        isURLtagged = false;
                    }
                },
                function(error){
                    $.each(error, function(i,v){
                    });
                }
            );
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
                                if (data.results.length === 0){
                                    $('#result-list').append('<li>Nothing found.</li>');
                                    $('#jamendo-search-results').css('display', 'block');
                                    $('#scrollbar1').tinyscrollbar();
                                }
                                else {
                                    $.each($(data.results), function(i, track){
                                        $('#result-list').append('<li class="song" style="line-height:1.6;"><a href="'+track.audio+'" class="track-url" data-song-name="'+track.name+'" data-song-id="'+track.id+'" data-artist-name="'+track.artist_name+'" data-album-name="'+track.album_name+'" data-album-image="'+track.album_image+'"><p class="track-info"><img src="'+track.album_image+'" /><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="album">Album: '+track.album_name+'</span><br /><span class="srch-track">Song: '+track.name+'</span></p></a></li>');
                                    });
                                    $('#cont-title').text("searching...");
                                    $('#cont-info').css('display', 'none');
                                    $('#jamendo-search-results').css('display', 'block');
                                    $('#scrollbar1').tinyscrollbar();
                                }
                            }
                        }
                    );
                }
                else {
                    $('#result-list').empty();
                    $('#jamendo-search-results').css('display', 'none');
                    $('#scrollbar1').tinyscrollbar();
                }
            }, 1000);
        },
        loadSong: function(el, ev){
            ev.preventDefault();
            var track = {
                track_id: $(el).attr('data-song-id'),
                name: $(el).attr('data-song-name'),
                artist_name: $(el).attr('data-artist-name'),
                audio: $(el).attr('href'),
                album_name: $(el).attr('data-album-name'),
                album_image: $(el).attr('data-album-image')
            }
            var ttl = '<span>'+$(el).attr('data-artist-name')+' - '+$(el).attr('data-song-name')+'</span>';
            jamList.add({
                title: ttl,
                oga: $(el).attr('href')
            }, true);
    /*        if (trackingTracks.length === 0) {
                trackingTracks.push(track);
                setNowPlaying(trackingTracks[0]);
            }
            else if(trackingTracks.length === 1){
                setNowPlaying(trackingTracks[0]);
                trackingTracks.push(track);
            }
            else{
                trackingTracks.push(track);
                setNowPlaying(track);
            }*/
            trackingTracks.push(track);
            setNowPlaying(track);
        },
        confirmTag: function(el, ev) {
            ev.preventDefault();
            $('#np-action-msg').html("Thank you!")
            $('#tag-action-button').removeAttr("class");
            $('#tag-action-button').addClass("in-progress");
            tagInfo.create(trackingTracks[jamList.current]);
            $('#tag-action-button').removeAttr("class");
            $('#tag-action-button').addClass("tag-none");
        },
        tagExisting: function(el, ev) {
            ev.preventDefault();
            $('#np-action-msg').html("Thank you!")
            $('#tag-action-button').removeAttr("class");
            $('#tag-action-button').addClass("in-progress");
            contentTrack.create(trackingTracks[jamList.current]);
            $('#tag-action-button').removeAttr("class");
            $('#tag-action-button').addClass("tag-none");
        },
        tagNew: function(el, ev) {
            ev.preventDefault();
            $('#np-action-msg').html("Thank you!")
            $('#tag-action-button').removeAttr("class");
            $('#tag-action-button').addClass("in-progress");
            URL.create(trackingTracks[jamList.current]);
            $('#tag-action-button').removeAttr("class");
            $('#tag-action-button').addClass("tag-none");
        }
    });
    var urlsControl = new URLs('#tracks', {});

});
function resetPlaylist(){
/*
    var starting = jamList.current;
    var rmindex = 0;

    for(var i=1; i<trackingTracks.length; i++){
        if(rmindex === jamList.current){
            rmindex++;
        }
        jamList.remove(rmindex);
    }
    //trackingTracks = trackingTracks.splice(starting, 1);
*/
    jamList.option("removeTime", 0);
    while (jamList.current > 0){
        jamList.remove(0);
    }
    while (jamList.playlist.length > 1){
        jamList.remove(1);
    }
    jamList.option("removeTime", "fast");
}

function resetNowPlaying() {
    if (jamList.playlist.length == 0) {
        $('#cont-box').css('display', 'none');
        $('#np-action').css('display', 'none');
    }
}
function setNowPlaying(track) {
    if (track === undefined)
        return;
    var times_tagged;
    if (track.track === undefined) {
        // this is not our track
        times_tagged = 0;
    }
    else {
        // this is our track
        times_tagged = track.times_tagged;
        track = track.track;
    }
    $('#np-info').empty();
    if (track.album_image === "")
        $('#np-info').html('<p class="track-info"><div class="empty-album"></div><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="srch-track">Song: '+track.name+'</span></p>');
    else
        $('#np-info').html('<p class="track-info"><img src="'+track.album_image+'" /><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="album">Album: '+track.album_name+'</span><br /><span class="srch-track">Song: '+track.name+'</span></p>');
    $('#scrollbar1').empty();
    $('#scrollbar1').html('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div><div class="viewport"><div class="overview"><ul id="result-list"><li id="result-songs"></li></ul></div></div>');
    $('#scrollbar1').tinyscrollbar();
    $('#search-box').val('');
    $('#cont-title').text("now playing...");
    $('#cont-box').css('display', 'block');
    $('#cont-info').css('display', 'block')
    $('#jamendo-search-results').css('display', 'none');
    $('#tag-action-button').removeAttr("class");
    if (times_tagged == 0) {
        if (isURLtagged) {
            $('#np-action-msg').html('You would be the first one to JamTag this page with this song.');
            $('#tag-action-button').removeAttr("class");
            $('#tag-action-button').addClass("retag");
            $('#np-action-img').attr('src', api.static+'img/retag.png');
            $('#np-action-img').attr('alt', 'retag');
        }
        else {
            $('#np-action-msg').html('This page hasn\'t yet been JamTagged. JamTag it!');
            $('#tag-action-button').addClass("tag");
            $('#np-action-img').attr('src', api.static+'img/tag.png');
            $('#np-action-img').attr('alt', 'tag');
        };
    }
    else {
        $('#np-action-msg').html('Other people have already JamTagged this page with this song. Confirm their choice.');
        $('#tag-action-button').addClass("confirm");
        $('#np-action-img').attr('src', api.static+'img/confirm.png');
        $('#np-action-img').attr('alt', 'confirm');
    };
    $('#tagging').css('display', 'block');
    //self.port.emit("playing", track.artist_name + ": " + track.name);
}

