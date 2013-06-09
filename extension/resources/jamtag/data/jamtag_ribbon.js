self.port.on("playing", function onPlay(song) {
	var label = document.getElementById("ribbon-tag-label");
	label.innerHTML = song;
});
