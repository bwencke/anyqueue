// View
function toggleView() {
  $('#contents').toggleClass('full-screen');
}

// Playback
function setPlayButton(playing) {
  $('#play-toggle').toggleClass('playing', playing);
}

function setPreviousEnabled(enabled) {
  $('#previous').toggleClass('enabled', enabled);
}

function setPlayToggleEnabled(enabled) {
  $('#play-toggle').toggleClass('enabled', enabled);
}

function setNextEnabled(enabled) {
  $('#next').toggleClass('enabled', enabled);
}

function isEnabled(btn) {
  return $('#'+btn).hasClass('enabled');
}

// Set Currently Playing
function setTrack(track) {
  if(track != null) {
    setArtistName(track.artist);
    setTrackName(track.track);
    setArtwork(track.artwork_url);
    setCurrentTime(0);
    setTrackDuration(track.duration);
    setVideoDisplay(track.source);
  }
}

function setArtistName(artist) {
  $('#artist').text(artist);
}

function setTrackName(track) {
  $('#track').text(track);
}

function setArtwork(url) {
  $('#background-artwork').css('background-image', 'url('+url+')');
  $('#album-artwork img').attr('src', url);
}

function setCurrentTime(time) {
  var tempTime = moment.duration(time);
  var str = "" + tempTime.seconds();
  var pad = "00";
  var ans = pad.substring(0, pad.length - str.length) + str;
  $('#current-time').text(tempTime.minutes() + ":" + ans);
  $('#progress-bar').val(time);
}

function setTrackDuration(time) {
  var tempTime = moment.duration(time);
  var str = "" + tempTime.seconds();
  var pad = "00";
  var ans = pad.substring(0, pad.length - str.length) + str;
  $('#progress-bar').attr('max', time);
  $('#duration').text(tempTime.minutes() + ":" + ans);
}

function setVideoDisplay(source) {
  if(source === 'youtube') {
    $('#video').css('display', 'block');
    $('#album-artwork img').css('display', 'none');
  } else {
    $('#video').css('display', 'none');
    $('#album-artwork img').css('display', 'block');
  }
}

// Add Item
function addToTrackList(track) {
  var newElementHTML =
    "<li id='" + track.id + "'>" +
      "<img src='" + track.artwork_url + "'></img>" +
      "<div class='info'>" +
        "<span class='artist'>" + track.artist + "</span>" +
        "<span class='track'>" + track.track + "<span>" +
      "</div>" +
    "</li>";
  $('#track-list ul').append(newElementHTML);
}

// Drag and Drop
function showDropZone() {
  $('#drop-zone').show();
}

function hideDropZone() {
  $('#drop-zone').hide();
}

function clearLinkGrabber() {
  var value = $('#link-grabber').val();
  $('#link-grabber').val("");
  return value;
}
