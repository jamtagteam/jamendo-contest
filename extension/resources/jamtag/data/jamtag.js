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
var options = {swfPath: "/js/lib/jPlayer", supplied: "mp3", wmode: "window", smoothPlayBar: true, keyEnabled: true};
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
        });
        var postData = JSON.stringify({'url': location});
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
            incld = 'licenses+musicinfo+stats',
            srch = params.srch,
            img = 50;
        return $.ajax({
            url: 'http://api.jamendo.com/v3.0/tracks/?client_id={0}&format={1}&limit={2}&include={3}&search={4}&groupby={5}&imagesize={6}'.format(clid,frmt,lmt,incld,srch,grpby,img),
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
            content_resource: api.resource
        });
        //var postData = JSON.stringify({content: api.resource});
        $("#damn").val($("#damn").val()+"Setting params for attempt no#"+counter+"which are: "+getData);
        return $.ajax({
            url: 'http://jamtag.offsetlab.net/api/v1/tag/' + api.format + getData,
            type: 'POST',
            //data: postData,
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
        //jamList.add(msg);
        this.on($(document), '.jam-search', 'keyup', 'searchJamendo');
        this.on($(document), '.track-url', 'click', 'loadSong');
        this.on($(document), '#confirm', 'click', 'confirmTag');
        this.on($(document), '.tag-existing', 'click', 'tagExisting');
        this.on($(document), '.tag-new', 'click', 'tagNew');
    },
    refreshList: function() {
        //$("#damn").val($("#damn").val()+"Entering refreshlist for attempt no#"+counter+" for location:"+dlocation);
        URL.findAll(
            {url: dlocation},
            function (urls) {
                //$("#damn").val($("#damn").val()+"Entering findall callback function for attempt no#"+counter+" for location:"+location);
                // what happens when there are no tracks
                if (urls.length !== 0) {
                    $("#damn").val($("#damn").val()+"Passed length for attempt no#"+counter);
                    $.each($(urls).attr('content').tracks, function(i, track){
                        $("#damn").val($("#damn").val()+"Pushing songs for attempt no#"+counter);
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
                        api.resource = v.content.id;
                    });
                    isURLtagged = true;
                } else {
                    var msg = {
                        title: 'Please tag this adress!',
                        mp3: null,
                    }
                    $('#tag-button').addClass('tag-new');
                    isURLtagged = false;
                }
            },
            function(error){
                $.each(error, function(i,v){
                    $("#damn").val($("#damn").val()+" damn error value:" + v);    
                });
                $("#damn").val($("#damn").val()+" damn error" + error);
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
                        $("#damn").val($("#damn").val()+"entering search jamendo" + srch);
                        if(data.headers.code == 0){
                            $("#damn").val($("#damn").val()+"success");
                            $('#result-list').empty();
                            $("#damn").val($("#damn").val()+"clearing old list");
                            $.each($(data.results), function(i, track){
                                $("#damn").val($("#damn").val()+"pushing results");
                                $('#result-list').append('<li class="song"><a href="'+track.audio+'" class="track-url" data-song-name="'+track.name+'" data-song-id="'+track.id+'" data-artist-name="'+track.artist_name+'" data-album-name="'+track.album_name+'" data-album-image="'+track.album_image+'"><p class="track-info"><img src="'+track.album_image+'" /><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="album">Album: '+track.album_name+'</span><br /><span class="track">Song: '+track.name+'</span></p></a></li>');
                            });
                            $("#damn").val($("#damn").val()+"sup?");
                            $('#jamendo-search-results').css('display', 'block');
                            $("#damn").val($("#damn").val()+"do the harlem shake");
                            $('#scrollbar1').tinyscrollbar();
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
            audio: $(el).attr('href'),
            album_name: $(el).attr('data-album-name'),
            album_image: $(el).attr('data-album-image')
        }
        jamList.add({
            title: $(el).attr('data-song-name'),
            mp3: $(el).attr('href')
        }, true);
        trackingTracks.push(track);
        setNowPlaying(track);
    },
    confirmTag: function(el, ev) {
        ev.preventDefault();
        $("#damn").val($("#damn").val()+"entering confirm tag for attempt no#"+counter);
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
//var location = window.location.href;
//INIT
var urlsControl = new URLs('#tracks', {});

self.port.on("show", function onShow(url, tbttl) {
    $("#damn").val($("#damn").val()+"Entering onShow for attempt no#"+counter);
    searchBox.focus();
    dlocation = url;
    doctitle = tbttl;
    counter++;
    jamList.setPlaylist();
    urlsControl.refreshList();
    $("#damn").val($("#damn").val()+"reaching end of onShow for attempt no#"+counter);
    $("#damn").val($("#damn").val()+"Counter for current song is:"+jamList.current); 
});


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
    if (track.album_image === undefined)
        $('#now-playing-div').html('<p class="track-info"><span class="artist">Artist: '+track.artist_name+'</span><br /><br /><span class="track">Song: '+track.name+'</span></p>');
    else
        $('#now-playing-div').html('<p class="track-info"><img src="'+track.album_image+'" /><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="album">Album: '+track.album_name+'</span><br /><span class="track">Song: '+track.name+'</span></p>');
    $('#scrollbar1').empty();
    $('#scrollbar1').html('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div><div class="viewport"><div class="overview"><ul id="result-list"><li id="result-songs"></li></ul></div></div>');
    $('#scrollbar1').tinyscrollbar();
    $('#search-box').val('');
    $('#now-playing').css('display', 'block');
    $('#jamendo-search-results').css('display', 'none');
    if (times_tagged == 0) {
        if (isURLtagged) {
            $('#tagging-info').html('You would be the first one to JamTag this page with this song.');
            $('#tag-action-button').addClass("retag")
        }
        else {
            $('#tagging-info').html('This page hasn\'t yet been JamTagged. JamTag it!');
            $('#tag-action-button').addClass("tag")
        }
    }
    else {
        $('#tagging-info').html('Other people have already JamTagged this page with this song. Confirm their choice.');
        $('#tag-action-button').addClass("confirm")
    }
    $('#tagging').css('display', 'block');
    self.port.emit("playing", track.artist_name + ": " + track.name);
}