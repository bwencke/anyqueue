$(document).ready(function() {
    var playbackWindow;

    $('#queue').on('click', function(e) {
        showQueue();
        e.stopPropagation();
    });
    $('#playback-ui').on('click', function(e) {
        hideQueue();
    });
    $('#previous').on('click', function(e) {
        if($(this).hasClass('enabled')) {
            previousTrack();
            play();
        }
        e.stopPropagation();
    });
    $('#play-toggle').on('click', function(e) {
        if($(this).hasClass('enabled')) {
            togglePlay();
        }
        e.stopPropagation();
    });
    $('#next').on('click', function(e) {
        if($(this).hasClass('enabled')) {
            nextTrack();
            play();
        }
        e.stopPropagation();
    });

    $('#search').on('submit', function(e) {
        var query = $("#search-field").val();
        $("#search-field").val("");
        resolveURL(query);
        e.preventDefault();
    });

    $('#link-grabber').on('input', function(e) {
        resolveURL($(this).val());
        $(this).val("");
        hideDrop();
    });

    $('#video').hide();
    $('#spotify').hide();
});

// init
SC.initialize({
  client_id: 'c419785c7ad86fbd169043db56b4f70b',
  redirect_uri: 'http://example.com/callback'
});

var youTube = new YouTube();
youTube.setKey('AIzaSyCdniBZuhbTIJApdTHR6O7SiP5VCrUWniY');

var youTubePlayer = YouTubePlayer('youtube-player');
var YTStates = {
    'UNSTARTED': -1,
    'ENDED': 0,
    'PLAYING': 1,
    'PAUSED': 2,
    'BUFFERING': 3,
    'VIDEO_CUED': 5
};

var position = 0;
var currentlyPlaying = null;
var playController = null;
var playing = false;

var queue = [];

// add track
function resolveURL(url) {
    var urlObj = new URL(url);
    console.log(urlObj);
    switch(urlObj.host) {
        case 'soundcloud.com':
            getSCTrack(url);
            break;
        case 'www.youtube.com':
            var regex = /\?v=([\w-]{11})/;
            getYouTubeTrack(urlObj.search.match(regex)[1]);
            break;
        case 'open.spotify.com':
            var regex = /\/track\/([\w-]{22})/;
            getSpotifyTrack(urlObj.pathname.match(regex)[1]);
            break;
        default:
            alert("Error: Couldn't Add Track");
            console.log(urlObj);
    }
}

function getSCTrack(url) {
    SC.resolve(url).then(function(data) {
        console.log(data);
        var artworkUrl = data.artwork_url.replace('large.jpg', 't500x500.jpg');
        return {
            'id': uuid.v4(),
            'source': 'soundcloud',
            'externalID': data.id,
            'artist': data.user.username,
            'track': data.title,
            'duration': data.duration,
            'artwork_url': artworkUrl
        };
    }).then(add);
}

function getYouTubeTrack(id) {

    youTube.getById(id, function(error, result) {
      if (error) {
        console.log(error);
      } else {
          console.log(result);
          if(result.items[0].status.embeddable === true) {
              var track = {
                  'id': uuid.v4(),
                  'source': 'youtube',
                  'externalID': id,
                  'artist': result.items[0].snippet.channelTitle,
                  'track': result.items[0].snippet.title,
                  'duration': result.items[0].contentDetails.duration,
                  'artwork_url': result.items[0].snippet.thumbnails.high.url
              };
              add(track);
              updateTrackUI(track);
          } else {
              alert("Can't add video.");
          }
      }
  });
}

function getSpotifyTrack(id) {

    Spotify.get("https://api.spotify.com/v1/tracks/" + id, function(err, data) {
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        }

        var track = {
            'id': uuid.v4(),
            'source': 'spotify',
            'externalID': id,
            'artist': data.artists[0].name,
            'track': data.name,
            'duration': data.duration_ms,
            'artwork_url': data.album.images[0].url
        };

        add(track);
        updateTrackUI();

    });
}

function updateTrackUI(track) {
    $('#' + track.id + ' img').attr('src',track.artwork_url);
    $('#' + track.id + ' .artist').text(track.artist);
    $('#' + track.id + ' .track').text(track.track);
}

// playback
function togglePlay() {
    if(playing) {
        pause();
    } else {
        play();
    }
}

function play() {
    if(playController == null) {
        if(position > queue.length) {
            return;
        }
        currentlyPlaying = queue[position];
        updateUI();
    } else {
        $('#play-toggle').addClass('playing');
        playing = true;
    }

    switch(currentlyPlaying.source) {
        case 'soundcloud':
            playSCTrack();
            break;
        case 'youtube':
            playYouTubeTrack();
            break;
        case 'spotify':
            playSpotifyTrack();
            break;
        default:
            alert("Error: Couldn't Play Track");
    }
}

function pause() {
    if(playController != null) {
        switch(currentlyPlaying.source) {
            case 'soundcloud':
                pauseSCTrack();
                break;
            case 'youtube':
                pauseYouTubeTrack();
                break;
            case 'spotify':
                pauseSpotifyTrack();
                break;
            default:
                alert("Error: Couldn't Play Track");
        }
        $('#play-toggle').removeClass('playing');
        playing = false;
    }
}

function stop() {
    if(playController != null) {
        switch(currentlyPlaying.source) {
            case 'soundcloud':
                stopSCTrack();
                break;
            case 'youtube':
                stopYouTubeTrack();
                break;
            case 'spotify':
                stopSpotifyTrack();
                break;
            default:
                alert("Error: Couldn't Play Track");
        }
        $('#play-toggle').removeClass('playing');
        playing = false;
    }
}

function playSCTrack() {
    if(playController == null) {
        SC.stream('/tracks/'+currentlyPlaying.externalID).then(function(player){
            player.seek(0);
            playController = player;
            playController.on('finish', function(e) {
                nextTrack();
                play();
            });
            playController.on('time', function() {
                updateTrackPosition(playController.currentTime());
            });
            play();
        });
    } else {
        playController.play();
    }
}

function pauseSCTrack() {
    if(playController != null) {
        playController.pause();
    }
}

function stopSCTrack() {
    if(playController != null) {
        playController.pause();
    }
    playController = null;
}

function playYouTubeTrack() {
    if(playController == null) {
        playController = youTubePlayer;
        playController.loadVideoById(currentlyPlaying.externalID);
        playController.on('stateChange', function(e) {
            if(e.data === YTStates.ENDED) {
                nextTrack();
                play();
            } else if(e.data === YTStates.PLAYING) {
                playController.getDuration().then(function(data) {
                    currentlyPlaying.duration = data;
                });
            }
        });
        var updateInterval = setInterval(function() {
            playController.getCurrentTime().then(function(data) {
                updateTrackPosition(data);
            });
        }, 100);
        $('#video').show();
    } else {
        playController.playVideo();
    }
}

function pauseYouTubeTrack() {
    if(playController != null) {
        playController.pauseVideo();
    }
}

function stopYouTubeTrack() {
    if(playController != null) {
        playController.stopVideo();
        playController.clearVideo();
        $('#video').hide();
    }
    playController = null;
}

function playSpotifyTrack() {
    if(playController == null) {
        playController = 'hi';
        $('#spotify iframe').attr('src', 'https://embed.spotify.com/?uri=spotify:track:'+currentlyPlaying.externalID);
        $('#spotify iframe').load(function() {
            play();
        });
    } else {
        console.log(playing);
        $('#spotify iframe').contents().find('#play-button').click();
        $('#spotify iframe').contents().find('.play-pause-btn').click();
    }
}

function pauseSpotifyTrack() {
    if(playController != null) {
        $('#spotify iframe').contents().find('#play-button').click();
        $('#spotify iframe').contents().find('.play-pause-btn').click();
    }
}

function stopSpotifyTrack() {
    if(playController != null) {
        $('#spotify iframe').contents().find('#play-button').click();
        $('#spotify iframe').contents().find('.play-pause-btn').click();
    }
    playController = null;
}

function updateTrackPosition(time) {
    if(!isNaN(time) && !isNaN(currentlyPlaying.duration)) {
        $('#progress-bar').attr('value', time);
        if($('#progress-bar').attr('max') !== currentlyPlaying.duration) {
            $('#progress-bar').attr('max', currentlyPlaying.duration);
        }
    }
}

function previousTrack() {
    if(position === 0) {
        return;
    }
    position--;
    if(position === 0) {
        $('#previous').removeClass('enabled');
    }
    if(queue.length > 1 && position+1 < queue.length) {
        $('#next').addClass('enabled');
    }
    stop();
}

function nextTrack() {
    if(position+1 >= queue.length) {
        return;
    }
    position++;
    if(queue.length > 1 && position > 0) {
        $('#previous').addClass('enabled');
    }
    if(position+1 >= queue.length) {
        $('#next').removeClass('enabled');
    }
    stop();
}

function updateUI() {
    $('#album-art-bg').css('background-image', 'url('+currentlyPlaying.artwork_url+')');
    $('#artist').text(currentlyPlaying.artist);
    $('#artwork').css('background-image', 'url('+currentlyPlaying.artwork_url+')');
    $('#track').text(currentlyPlaying.track);
}

function add(track) {
    queue.push(track);
    if(queue.length > 1 && position > 0) {
        $('#previous').addClass('enabled');
    }
    if(queue.length > 0) {
        $('#play-toggle').addClass('enabled');
    }
    if(queue.length > 1 && position+1 < queue.length) {
        $('#next').addClass('enabled');
    }
    updateQueue();
    if(queue.length === 1) {
        play();
    }
}

function updateQueue() {
    var output = "";
    queue.forEach(function(track, index) {
        output += "<li id='" + track.id + "'><img src='" + track.artwork_url + "'></img><div class='info'><span class='artist'>" + track.artist + "</span><span class='track'>" + track.track + "<span></div></li>";
    });
    $('#trackList ul').html(output);
}

function hideQueue() {
    $(body).addClass('full-screen');
}

function showQueue() {
    $(body).removeClass('full-screen');
}

function allowDrop(ev) {
    $('#drop-zone').show();
}

function hideDrop(ev) {
    $('#drop-zone').hide();
}
