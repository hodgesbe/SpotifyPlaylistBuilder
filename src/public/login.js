     (function() {
         "use strict";
         
         var main = function() {
        /**
        *DATABASE ENTRY HELPER
        *Add track to database, remove table row
        *@return void
        */
        function addEntry (context, obj) {
            $(context).closest ('tr').remove();
            var req = new XMLHttpRequest();
            req.open('POST', 'http://localhost:8888/addEntry');
            req.send(JSON.stringify(obj));
        }
        /**SEARCH BUTTON HANDLER
        * Searches spotify API for song
        * @return void
        */
        function runSearch(searchVal) {     
        var trackArr,
    //Creates a table with some basic styling. May need to remove the styling
    $responseTable = $('<table border="1" class="temp_search">');
            //CALL TO Spotify API
            $.getJSON("https://api.spotify.com/v1/search?q="+searchVal+"&type=track&market=US",
    function(data){
        trackArr = data.tracks.items;
        console.log(trackArr);
        $('#search-results').append("<p>Spotify found: ");
    
        $responseTable.append('<tr class="srtch-header"><th class="srch-art">Album Art</th><th class="srch-artist">Artist</th><th class="srch-album">Album</th><th class="srch-track">Track</th><th class="srch-preview">Preview</th><th class="srch-add">Add To Database</th></tr>');
        for (var i = 0;i < trackArr.length ; i++){
            var thisTrack = trackArr[i];
            var $tableRow = $('<tr  class="srtch-result">');
            $tableRow.append('<td><img src = ' + thisTrack.album.images[thisTrack.album.images.length-1].url+'></td>');
            $tableRow.append('<td class="srch-data">' + thisTrack.artists[0].name + '</td>');
            $tableRow.append('<td class="srch-data">' + thisTrack.album.name + '</td>');
            $tableRow.append('<td class="srch-data">' + thisTrack.name + '</td>');
            $tableRow.append('<td class="srch-data-btn"><a href=' + trackArr[i].preview_url + ' target="blank"><button type="button">Preview Track</button></a></td>');
            var $tableData = $('<td class="srch-data">');
            var $addButton = $('<button/>')
    .text('Add to Database')
    .addClass('srch-data-btn')
    .off().on("click", function() {addEntry(this, thisTrack)});
            $tableData.append($addButton);  
            $tableRow.append($tableData);
         
                      //  $.post('/addEntry', trackArr[i])
                    //        .done(function() { console.log('Database success');})
                    //            .fail(function () { console.log('Didnt work');})
 
    //        });
            $responseTable.append($tableRow);
        }

        $('#collapseTwo').append($responseTable);
});
        }
        /**SPOTIFY HELPER
         * Obtains parameters from the hash of the URL
         * @return Object
         */
        function getHashParams() {
          var hashParams = {};
          var e, r = /([^&;=]+)=?([^&;]*)/g,
              q = window.location.hash.substring(1);
          while ( e = r.exec(q)) {
             hashParams[e[1]] = decodeURIComponent(e[2]);
          }
          return hashParams;
        }
             
        var userProfileSource = document.getElementById('user-profile-template').innerHTML,
            userProfileTemplate = Handlebars.compile(userProfileSource),
            userProfilePlaceholder = document.getElementById('user-profile');

     

        var params = getHashParams();

        var access_token = params.access_token,
            refresh_token = params.refresh_token,
            error = params.error;

        if (error) {
          alert('There was an error during the authentication');
        } else {
          if (access_token) {
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                  userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                
                $('#searchButton').on('click', function () {
                runSearch($('#searchVal').val());
                });
                  
                  $('#login').hide();
                  $('#loggedin').show();
             
                }
            });
          } else {
              // render initial screen
              $('#login').show();
              $('#loggedin').hide();
          }

        }
      }
  $(document).ready(function () {
    main();
  });
}());