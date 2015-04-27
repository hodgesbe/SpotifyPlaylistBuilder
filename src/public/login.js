     (function() {
         "use strict";
         
         var main = function() {
        /**
        *DATABASE REMOVE HELPER
        *Remove from database, remove table row
        *@return void
        */
        function removeEntry (context, obj) {
            $(context).closest ('tr').remove();
            var req = new XMLHttpRequest();
            req.open('POST', 'http://localhost:8888/removeEntry');
            req.onreadystatechange = function (oEvent) {  
    if (req.readyState === 4) {  
        if (req.status === 200) {  
          console.log("CLI: Remove success");  
        } else {  
           console.log("CLI: Remove error");  
        }
    }
            };
   
            req.send(JSON.stringify(obj));
        }
                function addEntry (context, obj) {
            $(context).closest ('tr').remove();
            var req = new XMLHttpRequest();
            req.open('POST', 'http://localhost:8888/addEntry');
            req.onreadystatechange = function (oEvent) {  
    if (req.readyState === 4) {  
        if (req.status === 200) {  
          console.log("CLI: Add success");  
        } else {  
           console.log("CLI: Add error");  
        }
    }
            };
   
            req.send(JSON.stringify(obj));
        }
        /**SEARCH BUTTON HANDLER
        * Searches spotify API for song
        * @return void
        */
        function runSearch(searchVal) {     
        var trackArr,
    
    //CREATE TABLE
    $responseTable = $('<table border="1" class="temp_search">');
    //CALL TO Spotify API
    $.getJSON("https://api.spotify.com/v1/search?q="+searchVal+"&type=track&market=US",
        function(data){
        trackArr = data.tracks.items;
        //console.log(trackArr); //prints results to console
        
        $('#search-results').append("<p>Spotify found: ");
        
        //TABLE HEADER
        $responseTable.append('<tr class="srtch-header"><th class="srch-art">Album Art</th><th class="srch-artist">Artist</th><th class="srch-          album">Album</th><th class="srch-track">Track</th><th class="srch-preview">Preview</th><th class="srch-add">Add To Database</th></tr>');
        
        //ITERATE OVER SEARCH RESULTS
        for (var i = 0;i < trackArr.length ; i++){
            //ADD IMAGE/DEETS TO TABLE
            var thisTrack = trackArr[i];
            var $tableRow = $('<tr  class="srtch-result">');
            $tableRow.append('<td><img src = ' + thisTrack.album.images[thisTrack.album.images.length-1].url+'></td>');
            $tableRow.append('<td class="srch-data">' + thisTrack.artists[0].name + '</td>');
            $tableRow.append('<td class="srch-data">' + thisTrack.album.name + '</td>');
            $tableRow.append('<td class="srch-data">' + thisTrack.name + '</td>');
            
            //PREVIEW BUTTON FOR THIS TRACK
            var $tableData = $('<td class="srch-data">');
            var $playButton = $('<button/>')
                .text('Play Preview')
                .addClass('srch-data-btn');
            var $playAnchor = $('<a/>')
                .attr('href', thisTrack.preview_url)
                .attr('target', 'blank');
            $playAnchor.append($playButton);
            $tableData.append($playAnchor);  
            $tableRow.append($tableData);
            $tableData = $('<td class="srch-data">');
            
            //ADD TO DBASE BUTTON FOR THIS TRACK
            var $addButton = $('<button/>')
                .text('Store')
                .addClass('srch-data-btn')
                .off().on("click", function() {addEntry(this, thisTrack)});
            $tableData.append($addButton);  
            $tableRow.append($tableData);

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
            //we have the token, get the user's info
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                  userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                
                //attach search button handler once we're logged in
                $('#searchButton').on('click', function () {
                runSearch($('#searchVal').val());
                });
                  //user is logged in, show details
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