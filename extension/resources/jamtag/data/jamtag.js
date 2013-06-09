// When the user hits return, send the "text-entered"
// message to main.js.
// The message payload is the contents of the edit box.
var searchBox = $("#search-box");
var location;
var doctitle;

//api helper
var api = {
    "format": "?format=json"
};

// var searchBox = document.getElementById("search-box");
// var urlBox = document.getElementById("url_input");
// var titleBox = document.getElementById("title_input");

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

//'{0} says {1}'.format('Chubz', 'hello');

// initial setup
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

self.port.on("show", function onShow(url, tbttl) {
  searchBox.focus();
  location = url;
  $('#scrollbar1').tinyscrollbar();
  $('#jp-playlist').tinyscrollbar();
});

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
        findAll: function(params){
        	$("#damn").val("bla" + location);
            var url = '';
            if (params.location) {
                url = params.location;
            }
            var result = $.ajax({
                url: 'http://jamtag.offsetlab.net/api/v1/url/' + api.format + '&url=' + url,
                type: 'GET',
                dataType: 'json',
                crossDomain: true
            });
            //$("#damn").val(url);
            return result;
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
            var result = $.ajax({
                url: 'http://jamtag.offsetlab.net/api/v1/url/' + api.format + getData,
                type: 'POST',
                contentType: 'application/json',
                data: postData,
                dataType: 'json',
                async: false,
				crossDomain: true
            });
            console.log(result);
            return result;
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
            });
            var postData = JSON.stringify({content: api.resource});
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
            var self = this;
            $("#damn").val("jesus");
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
                            api.resource = 'http://jamtag.offsetlab.net/api/v1/content/' + v.content.id + '/';
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
                        function(results){
                            $('#result-list').empty();
                            $.each($(results), function(i, track){
                                $('#result-list').append('<a href="'+track.audio+'" class="track-url" data-song-name="'+track.name+'" data-song-id="'+track.id+'" data-artist-name="'+track.artist_name+'"><li class="song"><p class="track-info"><img src="'+track.album_image+'" /><span class="artist">Artist: '+track.artist_name+'</span><br /><span class="album">Album: '+track.album_name+'</span><br /><span class="track">Song:'+track.name+'</span></p></li></a>');
                            });
                            $('#scrollbar1').tinyscrollbar();
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
    //var location = window.location.href;
    var urlsControl = new URLs('#tracks', {});
});
