var observer = null;

$(function() {

  // Drag & Drop

    // drag
    $('body').on('dragover', function() {
      showDropZone();
    });
    $('#drop-zone').on('dragleave', function() {
      hideDropZone();
    });

    // drop
    $('#link-grabber').on('input', function(e) {
      addTrack(clearLinkGrabber());
      hideDropZone();
    });

  // Clicks

    // menu
    $('#add').on('click', function() {
      console.log("add");
    });
    $('#queue').on('click', function() {
      toggleView();
    });

    // controls
    $('#previous').on('click', function() {
      if(isEnabled('previous')) {
        previousTrack();
      }
    });
    $('#play-toggle').on('click', function() {
      if(isEnabled('play-toggle')) {
        togglePlayTrack();
      }
    });
    $('#next').on('click', function() {
      if(isEnabled('next')) {
        nextTrack();
      }
    });

    observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === "class") {
                var attributeValue = $(mutation.target).prop(mutation.attributeName);
                console.log("Class attribute changed to:", attributeValue);
            }
        });
    });

});
