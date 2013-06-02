var jamtag = {

    oldURL: null,
/*
    init: function() {
        if(gBrowser) 
            gBrowser.addEventListener("DOMContentLoaded", this.onPageLoad, false);
    },
*/
    init: function() {
        if(gBrowser) 
            gBrowser.addEventListener("DOMContentLoaded", this.onPageLoad, false);
        gBrowser.addProgressListener(this);
    },

    uninit: function() {
        gBrowser.removeProgressListener(this);
    },

    start: function() {
        var sbar = document.getElementById("sidebar")
        sbar.addEventListener("DOMContentLoaded", this.onPageLoad, false);
    },
    
    getTitle: function() {

        var doc = window.top.getBrowser().selectedBrowser.contentWindow.document;
        var title_box = document.getElementById("tag_title");
        title_box.value = doc.title;

    },

    getURL: function() {

        var url = window.content.location;
        var url_box = document.getElementById("tag_url");
        url_box.value = url;

    },

    onPageLoad: function(aEvent) {
        var sbar = document.getElementById("sidebar")
        sbar.removeEventListener("DOMContentLoaded", this.onPageLoad, false);
        var sidebarWindow = sbar.contentWindow;
        if (sidebarWindow.location.href == "chrome://jamtag/content/jamtagsidebar.xul") {
            setTimeout(writeContent, 100);
        }
    },

    processNewData: function(aURI) {
        if (aURI.spec == this.oldURL) return;
        var sidebarWindow = document.getElementById("sidebar").contentWindow;
        if (sidebarWindow.location.href == "chrome://jamtag/content/jamtagsidebar.xul") {
            setTimeout(writeContent, 100);
        }
        this.oldURL = aURI.spec;
    },
 
    QueryInterface: XPCOMUtils.generateQI(["nsIWebProgressListener",
                                           "nsISupportsWeakReference"]),
 
    onLocationChange: function(aProgress, aRequest, aURI) {
        this.processNewData(aURI);
    },
 
    onStateChange: function() {},
    onProgressChange: function() {},
    onStatusChange: function() {},
    onSecurityChange: function() {}
};

function writeContent()
{
    var sidebarWindow = document.getElementById("sidebar").contentWindow;
    var url = window.content.location;
    var url_box = sidebarWindow.document.getElementById("tag_url");
    url_box.value = url;
    var doc = window.top.getBrowser().selectedBrowser.contentWindow.document;
    var title_box = sidebarWindow.document.getElementById("tag_title");
    title_box.value = doc.title;
}

function setSidebarWidth(newwidth) {
    window.top.document.getElementById("sidebar-box").width=newwidth;
}

function openJamTagSidebar() {
    toggleSidebar('JamTagSidebar');
    jamtag.start();
    setSidebarWidth(243);
}

window.addEventListener("load", function() { jamtag.init() }, false);
window.addEventListener("unload", function() { jamtag.uninit() }, false);