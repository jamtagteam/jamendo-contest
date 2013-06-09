JamTag Hidden Metadata Service 
==============================

JamTag is a service written in Python that stores associations between Jamendo tracks and web pages. It consists of a web service written in Python and a browser extension, currently written for Firefox browser.
The idea is that every web page can have associated hidden metadata as a flavor.
The users that have the extension installed can search Jamendo for songs and tag the current web page they are on with their choice of a song.
For instance, one may visit a Wikipedia article about the International Space Station and see that there are songs associated with it, like some ambiental space music, and play them, agree with the choice, or add another song to it.
The extension is written with web technologies using some of the popular JavaScript libraries:
* jQuery
* CanJS
* jPlayer

The service is written in Python with main components being:
* Django
* django-tastypie

Issues
------------------------------
Of course, there are issues with the app, but what can you do with limited resources? :)
Should there be time, we'd like to update this and possibly make more extensions to the whole concept, like adding users into the mix, support more browsers, do a proper landing page for the service since there is none at the moment.

Disclaimer
------------------------------
While this is a working prototype, a proof of concept, of an app idea, it would be interesting to see what new things we could do with the music.

Screenshots
------------------------------
<img src="http://jamtag.offsetlab.net/media/img/screenshot-1.jpeg" />
<img src="http://jamtag.offsetlab.net/media/img/screenshot-2.jpeg" />
<img src="http://jamtag.offsetlab.net/media/img/screenshot-3.jpeg" />
