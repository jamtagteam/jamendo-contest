self.port.on("playingForWidget", function (song) {
	var label = document.getElementById("ribbon-tag-label");
	label.innerHTML = song;
});
