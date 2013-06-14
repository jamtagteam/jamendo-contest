const widgets = require("sdk/widget");
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var tbttl = tabs.activeTab.title;
var url = tabs.activeTab.url;

var jamtag_panel = require("sdk/panel").Panel({
  width: 259,
  height: 700,
  contentURL: data.url("jamtag.html"),
  contentScriptFile: [data.url("js/lib/jquery-2.0.0.min.js"), data.url("js/lib/can.jquery.min.js"), data.url("js/lib/jquery.tinyscrollbar.min.js"), data.url("js/lib/jPlayer/jquery.jplayer.min.js"), data.url("js/lib/jPlayer/add-on/jplayer.playlist.js"), data.url("jamtag.js")]
});

var jamtag_player_widget = widgets.Widget({
  label: "JamTag",
  id: "jamtag-panel",
  contentURL: data.url("icon.png"),
  panel: jamtag_panel
});

tabs.on('open', function(tab){
  tab.on('ready', function(tab){
    tbttl = tab.title;
    url = tab.url;
  });
});

tabs.on('ready', function(tab){
    if(tab == tabs.activeTab){
      tbttl = tab.title;
      url = tab.url;
    }
});

tabs.on('activate', function(tab){
    tbttl = tab.title;
    url = tab.url;
});

jamtag_panel.on("show", function() {
  jamtag_panel.port.emit("show", url,tbttl);
});
