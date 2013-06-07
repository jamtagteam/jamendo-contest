var data = require("sdk/self").data;
// Construct a panel, loading its content from the "text-entry.html"
// file in the "data" directory, and loading the "get-text.js" script
// into it.
var jamtag_panel = require("sdk/panel").Panel({
  width: 270,
  height: 500,
  contentURL: data.url("jamtag.html"),
  contentScriptFile: [data.url("js/lib/jquery-2.0.0.min.js"), data.url("js/lib/can.jquery.min.js"), data.url("js/lib/jPlayer/jquery.jplayer.min.js"), data.url("js/lib/jPlayer/add-on/jplayer.playlist.min.js"), data.url("jamtag.js")]
});

// Create a widget, and attach the panel to it, so the panel is
// shown when the user clicks the widget.
require("sdk/widget").Widget({
  label: "JamTag",
  id: "text-entry",
  contentURL: data.url("icon.png"),
  panel: jamtag_panel
});

// When the panel is displayed it generated an event called
// "show": we will listen for that event and when it happens,
// send our own "show" event to the panel's script, so the
// script can prepare the panel for display.
jamtag_panel.on("show", function() {
  jamtag_panel.port.emit("show");
});

// Listen for messages called "text-entered" coming from
// the content script. The message payload is the text the user
// entered.
// In this implementation we'll just log the text to the console.
/*jamtag_panel.port.on("text-entered", function (text) {
  console.log(text);
  jamtag_panel.hide();
});*/
//activeTab.title
var tabs = require("sdk/tabs");
tabs.on("ready", function(tab) {
    //jamtag_panel.port.emit("alert", "Message from the add-on");
    //console.log('tab is loaded', tab.title, tab.url);
    tab.attach({
      contentScript:
        'window.alert("tab loaded");'
  });
});
