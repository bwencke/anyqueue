var SoundCloud = function() {

  var SC = require('soundcloud');
  SC.initialize({
    client_id: keys.soundcloud,
    redirect_uri: 'http://example.com/callback'
  });

  this.add = function(url) {
    SC.resolve(url).then(function(data) {
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
    }).then(function(track) {
      appendTrack(track);
    });
  };

  this.play = function() {
    if(playController == null) {
      SC.stream('/tracks/'+queue[position].externalID).then(function(player){
        playController = player;
        playController.seek(0);
        playController.on('finish', function(e) {
          nextTrack();
        });
        playController.on('time', function() {
          setCurrentTime(playController.currentTime());
        });
        playTrack();
      });
    } else {
        playController.play();
    }
  }

  this.pause = function() {
    if(playController != null) {
      playController.pause();
    }
  };

  this.stop = function() {
    this.pause();
    playController.seek(0);
    playController = null;
  };

}
