var platforms = new Platforms();

var queue = [];
var playController = null;
var position = 0;
var playing = false;

function getPlatform(url) {
    var urlObj = new URL(url);
    var result = null;
    for(var platformId in platforms) {
      if(platforms[platformId].url == urlObj.host) {
        result = platforms[platformId];
      }
    }

    return result;
}

// Manage Queue
function addTrack(url) {
  getPlatform(url).controller.add(url);
}

function appendTrack(track) {
  queue.push(track);
  addToTrackList(track);
  if(queue.length > 1 && position > 0) {
      setPreviousEnabled(true);
  }
  if(queue.length > 0) {
      setPlayToggleEnabled(true);
  }
  if(queue.length > 1 && position+1 < queue.length) {
      setNextEnabled(true);
  }
  if(queue.length === 1) {
    playTrack();
    setTrack(queue[position]);
  }
}

// Playback
function togglePlayTrack() {
    if(playing) {
      pauseTrack();
    } else {
      playTrack();
    }
}

function playTrack() {
  playing = true;
  platforms[queue[position].source].controller.play();
  setPlayButton(playing);
}

function pauseTrack() {
  playing = false;
  platforms[queue[position].source].controller.pause();
  setPlayButton(playing);
}

function stopTrack() {
  playing = false;
  platforms[queue[position].source].controller.stop();
  setPlayButton(playing);
}

function previousTrack() {
  if(position === 0) {
      return;
  }
  stopTrack();
  position--;
  if(position === 0) {
      setPreviousEnabled(false);
  }
  if(queue.length > 1 && position+1 < queue.length) {
      setNextEnabled(true);
  }
  playTrack();
  setTrack(queue[position]);
}

function nextTrack() {
  if(position+1 >= queue.length) {
      return;
  }
  stopTrack();
  position++;
  if(queue.length > 1 && position > 0) {
      setPreviousEnabled(true);
  }
  if(position+1 >= queue.length) {
      setNextEnabled(false);
  }
  playTrack();
  setTrack(queue[position]);
}
