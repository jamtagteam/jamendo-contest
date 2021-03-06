// When the user hits return, send the "text-entered"
// message to main.js.
// The message payload is the contents of the edit box.
var counter = 0,
    searchBox = $("#search-box"),
    location = "",
    doctitle = "";
var isURLtagged;
//api helper
var api = {
    "format": "?format=json&"
};

// var searchBox = document.getElementById("search-box");
// var urlBox = document.getElementById("url_input");
// var titleBox = document.getElementById("title_input");
var cssSelector = {jPlayer: "#jquery_jplayer_1", cssSelectorAncestor: "#jp_container_1"};
var playlist = [];
var options = {swfPath: "/js/lib/jPlayer", supplied: "oga", wmode: "window", smoothPlayBar: true, keyEnabled: true};
var jamList = new jPlayerPlaylist(cssSelector, playlist, options);
jamList.option("enableRemoveControls", true);
jamList.option("removeTime", 0);

var trackingTracks = []; //variable for tracking all track info that we have in our or jamendos api, should be indexed like players playlist


// delay function
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();
/*var textArea = document.getElementById("edit-box");
textArea.addEventListener('keyup', function onkeyup(event) {
  if (event.keyCode == 13) {
    // Remove the newline.
    text = textArea.value.replace(/(\r\n|\n|\r)/gm,"");
    self.port.emit("text-entered", text);
    textArea.value = '';
  }
}, false);*/

// Listen for the "show" event being sent from the
// main add-on code. It means that the panel's about
// to be shown.
//
// Set the focus to the text area so the user can
// just start typing.

// basic helpers
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number]: match;
            }
        );
    };
}

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
            crossDomain: true,
            beforeSend: function(){
                $('.jp-playlist ul').append("<li><div><div id='playlist-loading-indicator'></div><span class='jp-playlist-item'>Loading songs...</span></div></li>");
            },
            complete: function(){
                $('.jp-playlist ul li:last-child').remove();
            }
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
            crossDomain: true,
            beforeSend: function(){
                $('#tagging-info').html("Tagging...")
                $('#tag-action-button').removeAttr("class");
                $('#tag-action-button').addClass("in-progress");
            },
            complete: function(){
                $('#tagging-info').html("Thank you!")
                $('#tag-action-button').removeAttr("class");
                $('#tag-action-button').addClass("tag-none");
            }
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
            async: false,
            beforeSend: function(){
                $('#jamendo-search-results').css('display', 'none');
                $('#result-list').empty();
                $('#result-list').append("<li><div><div id='playlist-loading-indicator'></div><span class='jp-playlist-item' style='font-size: 12px; font-weight: 200;'>Searching...</span></div></li>");
                $('#jamendo-search-results').css('display', 'block');
                $('#scrollbar1').tinyscrollbar();
            },
            complete: function(){
                $('#jamendo-search-results').css('display', 'none');
                $('#result-list').empty();
            }

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
            crossDomain: true,
            beforeSend: function(){
                $('#tagging-info').html("Tagging...")
                $('#tag-action-button').removeAttr("class");
                $('#tag-action-button').addClass("in-progress");
            },
            complete: function(){
                $('#tagging-info').html("Thank you!")
                $('#tag-action-button').removeAttr("class");
                $('#tag-action-button').addClass("tag-none");
            }
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
            crossDomain: true,
            beforeSend: function(){
                $('#tagging-info').html("Tagging...")
                $('#tag-action-button').removeAttr("class");
                $('#tag-action-button').addClass("in-progress");
            },
            complete: function(){
                $('#tagging-info').html("Thank you!")
                $('#tag-action-button').removeAttr("class");
                $('#tag-action-button').addClass("tag-none");
            }
        });
    }
}, {});
// CONTROLLERS
var URLs = can.Control({
    init: function(element, options) {
        this.on($(document), '.jam-search', 'keyup', 'searchJamendo');
        this.on($(document), '.track-url', 'click', 'loadSong');
        this.on($(document), '.confirm', 'click', 'confirmTag');
        this.on($(document), '.retag', 'click', 'tagExisting');
        this.on($(document), '.tag', 'click', 'tagNew');
    },
    refreshList: function() {
        URL.findAll(
            {url: dlocation},
            function (urls) {
                // what happens when there are no tracks
                if (urls.length !== 0) {
                    isURLtagged = true;
                    trks = $(urls[0]).attr('content').tracks
                    if (trks > 5)
                        trks = trks.slice(0, 5);
                    $.each(trks, function(i, track){
                        var ttl = '<span>'+track.track.artist_name+' - '+track.track.name+'</span>';
                        var song = {
                            title: ttl,
                            //oga: track.audio,
                            oga: track.track.audio,
                        }
                        var extended_track = {
                            track: track.track,
                            url: urls[0].url
                        }
                        if(trackingTracks[0] !== undefined){
                            if(trackingTracks[0].track_id != track.track.id && (trackingTracks[0].track === undefined  || trackingTracks[0].track.id != track.track.id)){
                                jamList.add(song, false);
                                trackingTracks.push(extended_track);
                                if (trackingTracks[0].url != dlocation) {
                                        trackingTracks[0].times_tagged = 0;
                                }
                                setNowPlaying(trackingTracks[0]);
                            }
                            else{
                                if (trackingTracks[0].url != dlocation) {
                                    trackingTracks[0].times_tagged = 0;
                                }
                                setNowPlaying(trackingTracks[0]);
                            }
                        }
                        else{
                            jamList.add(song, true);
                            trackingTracks.push(extended_track);
                            setNowPlaying(extended_track);
                        }

                    });
                    $.each(urls, function(i,v){
                        api.resource = v.content.id;
                    });
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
                                    $('#result-list').append('<li class="song"><a href="'+track.audio+'" class="track-url" data-song-name="'+track.name+'" data-song-id="'+track.id+'" data-artist-name="'+track.artist_name+'" data-album-name="'+track.album_name+'" data-album-image="'+track.album_image+'"><p class="track-info"><img src="'+track.album_image+'" /><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="album">Album: '+track.album_name+'</span><br /><span class="srch-track">Song: '+track.name+'</span></p></a></li>');
                                });
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
        tagInfo.create(trackingTracks[jamList.current]);
    },
    tagExisting: function(el, ev) {
        ev.preventDefault();
        contentTrack.create(trackingTracks[jamList.current]);
    },
    tagNew: function(el, ev) {
        ev.preventDefault();
        URL.create(trackingTracks[jamList.current]);
    }
});
//INIT
var urlsControl = new URLs('#tracks', {});

self.port.on("show", function onShow(url, tbttl) {
    searchBox.focus();
    dlocation = url;
    doctitle = tbttl;
    counter++;
    resetPlaylist(jamList.current);
    urlsControl.refreshList();
    if(trackingTracks.length <= 1){
        setNowPlaying(trackingTracks[0]);
    }
    //$("#damn").val($("#damn").val()+"url: "+dlocation)
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
    while (jamList.current > 0){
        jamList.remove(0);
    }
    while (jamList.playlist.length > 1){
        jamList.remove(1);
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
    $('#now-playing-div').empty();
    if (track.album_image === "")
        $('#now-playing-div').html('<p class="track-info"><div class="empty-album"></div><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="srch-track">Song: '+track.name+'</span></p>');
    else
        $('#now-playing-div').html('<p class="track-info"><img src="'+track.album_image+'" /><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="album">Album: '+track.album_name+'</span><br /><span class="srch-track">Song: '+track.name+'</span></p>');
    $('#scrollbar1').empty();
    $('#scrollbar1').html('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div><div class="viewport"><div class="overview"><ul id="result-list"><li id="result-songs"></li></ul></div></div>');
    $('#scrollbar1').tinyscrollbar();
    $('#search-box').val('');
    $('#now-playing').css('display', 'block');
    $('#jamendo-search-results').css('display', 'none');
    $('#tag-action-button').removeAttr("class");
    if (times_tagged == 0) {
        if (isURLtagged) {
            $('#tagging-info').html('You would be the first one to JamTag this page with this song.');
            $('#tag-action-button').addClass("retag");
        }
        else {
            $('#tagging-info').html('This page hasn\'t yet been JamTagged. JamTag it!');
            $('#tag-action-button').addClass("tag");
        };
    }
    else {
        $('#tagging-info').html('Other people have already JamTagged this page with this song. Confirm their choice.');
        $('#tag-action-button').addClass("confirm");
    };
    $('#tagging').css('display', 'block');
    //self.port.emit("playing", track.artist_name + ": " + track.name);
}

function resetNowPlaying() {
    if (jamList.playlist.length == 0) {
        $('#now-playing').css('display', 'none');
        $('#tagging').css('display', 'none');
    }
}
