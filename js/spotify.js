var Spotify = function() {

  var spotify = require('spotify');

  var resolveUrl = function(url) {
    var urlObj = new URL(url);
    var regex = /\/track\/([\w-]{22})/;
    return urlObj.pathname.match(regex)[1];
  }

  this.add = function(url) {

    var id = resolveUrl(url);

    spotify.get("https://api.spotify.com/v1/tracks/" + id, function(err, data) {
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

      appendTrack(track);

    });

  };

  this.play = function() {
    if(playController == null) {
      playController = 'hi';
      $('#spotify iframe').attr('src', 'https://embed.spotify.com/?uri=spotify:track:'+queue[position].externalID);
      $('#spotify iframe').on('load', function() {
        setTimeout(playTrack(), 10);
        setTimeout(setPlayButtonListeners(), 20);
      });
    } else {
      $('#spotify iframe').contents().find('#play-button').click();
      $('#spotify iframe').contents().find('.play-pause-btn').click();
    }
  };

  this.pause = function() {
    if(playController != null) {
      $('#spotify iframe').contents().find('#play-button').click();
      $('#spotify iframe').contents().find('.play-pause-btn').click();
    }
  }

  this.stop = function() {
    this.pause();
    clearInterval(interval);
    playController = null;
  }

  var interval = null;
  var setPlayButtonListeners = function() {
    interval = setInterval(function() {
      if($('#spotify iframe').contents().find('.music-playing').length>0 || ($('#spotify iframe').contents().find('#play-button') && $('#spotify iframe').contents().find('#play-button').hasClass('playing'))) {
        playing = true;
      } else {
        playing = false;
      }
      setPlayButton(playing);
      var currentTimeStr = "0:00";
      if($('#spotify iframe').contents().find('.time-spent').length>0) {
        currentTimeStr = $('#spotify iframe').contents().find('.time-spent').text();
      } else if($('#spotify iframe').contents().find('#progress-time').length>0){
        currentTimeStr = $('#spotify iframe').contents().find('#progress-time').text();
      }
      var currentTimeStrSplit = currentTimeStr.split(":");
      if(currentTimeStrSplit.length > 0) {
        var value = parseInt(parseInt(currentTimeStrSplit[currentTimeStrSplit.length-1])*1000 + parseInt(currentTimeStrSplit[currentTimeStrSplit.length-2])*1000*60);
        if(!isNaN(value)) {
          setCurrentTime(value);
          if(playing && value >= queue[position].duration) {
            console.log("finished");
            clearInterval(interval);
            nextTrack();
          }
        }
      } else {
        setCurrentTime(0);
      }
    }, 100);
  };

};
