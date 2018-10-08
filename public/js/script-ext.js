/* FastClick */
if ('addEventListener' in document) {
	document.addEventListener('DOMContentLoaded', function() {
		FastClick.attach(document.body);
	}, false);
};

/* No Sleep */
var noSleep = new NoSleep();

function enableNoSleep() {
  noSleep.enable();
  document.removeEventListener('click', enableNoSleep, false);
}

// Enable wake lock.
// (must be wrapped in a user input event handler e.g. a mouse or touch handler)
document.addEventListener('click', enableNoSleep, false);

/* Youtube */
function onPlayerStateChange(event)
{
	var params = {
		status: event.data,
		currentTime: player.getCurrentTime()
	};
}

var tag = document.createElement('script');
tag.src = '//www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var playerVars      = {"start":0,"autoplay":1,"volume":50,"iv_load_policy":3,"rel":0,"controls":1,"disablekb":1,"showinfo":0}
var defaultVolume   = playerVars.volume;

var player;
function onYouTubeIframeAPIReady()
{
	player = new YT.Player('playerYoutube', {
		height: '25px',
		width: '500px',
		videoId: '',
		playerVars: playerVars,
		events: {"onStateChange":"onPlayerStateChange"}
	});
	player.pauseVideo();
}

