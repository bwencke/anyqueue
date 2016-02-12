var YouTube = function() {

  var youTubeData = new (require('youtube-node'))();
  var youTubePlayer = require('youtube-player')('video');
  youTubeData.setKey(keys.youtube);

  var YTStates = {
    'UNSTARTED': -1,
    'ENDED': 0,
    'PLAYING': 1,
    'PAUSED': 2,
    'BUFFERING': 3,
    'VIDEO_CUED': 5
  };

  var resolveUrl = function(url) {
    var urlObj = new URL(url);
    var regex = /\?v=([\w-]{11})/;
    return urlObj.search.match(regex)[1];
  }

  this.add = function(url) {
    var id = resolveUrl(url);
    youTubeData.getById(id, function(error, result) {
      if (error) {
        console.log(error);
      } else {
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
          appendTrack(track);
        } else {
            alert("Can't add video.");
        }
      }
    });
  }

  this.play = function() {
    if(playController == null) {
      playController = youTubePlayer;
      playController.loadVideoById(queue[position].externalID);
      playController.on('stateChange', function(e) {
        if(e.data === YTStates.ENDED) {
          nextTrack();
        } else if(e.data === YTStates.PLAYING) {
          playing = true;
          setPlayButton(playing);
          playController.getDuration().then(function(data) {
            queue[position].duration = data;
            setTrackDuration(queue[position].duration);
          });
        } else if(e.data === YTStates.PAUSED) {
          playing = false;
          setPlayButton(playing);
        }
      });
      var updateInterval = setInterval(function() {
        playController.getCurrentTime().then(function(data) {
          setCurrentTime(data);
        });
      }, 100);
    } else {
      playController.playVideo();
    }
  };

  this.pause = function() {
    if(playController != null) {
      playController.pauseVideo();
    }
  };

  this.stop = function() {
    if(playController != null) {
      playController.stopVideo();
      playController.clearVideo();
    }
    playController = null;
  };

}
