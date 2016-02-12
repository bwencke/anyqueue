var Platforms = function() {
  return {
    'soundcloud': {
      'url': 'soundcloud.com',
      'controller': new SoundCloud()
    },
    'youtube': {
      'url': 'www.youtube.com',
      'controller': new YouTube()
    },
    'spotify': {
      'url': 'open.spotify.com',
      'controller': new Spotify()
    }
  };
};
