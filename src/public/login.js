     (function() {
         "use strict";
         
         var main = function() {
             
        /**SEARCH BUTTON HANDLER
        * Searches spotify API for song
        * @return void
        */
        function runSearch(searchVal) {     
        var trackArr,
    //Creates a table with some basic styling. May need to remove the styling
    $responseTable = $('<table border="1" style="width:100%">');
            //CALL TO Spotify API
            $.getJSON("https://api.spotify.com/v1/search?q="+searchVal+"&type=track&market=US",
    function(data){
        trackArr = data.tracks.items;
        console.log(trackArr);
        $('#search-results').append("<p>Spotify found: ");
    
        $responseTable.append("<tr><th>Album Art</th><th>Artist</th><th>Album</th><th>Track</th><th>Preview</th><th>Add To Database</th></tr>");
        for (var i = 0;i < trackArr.length ; i++){
            var $tableRow = $("<tr>");
            $tableRow.append('<td align="center"><img src = ' + trackArr[i].album.images[trackArr[i].album.images.length-1].url+'></td>'); 
            $tableRow.append('<td align="center">' + trackArr[i].artists[0].name + '</td>');
            $tableRow.append('<td align="center">' + trackArr[i].album.name + '</td>');
            $tableRow.append('<td align="center">' + trackArr[i].name + '</td>');
            $tableRow.append('<td align="center"><a href=' + trackArr[i].preview_url + ' target="blank"><button type="button">Preview Track</button></a></td>');
            $tableRow.append('<td align="center"><button type="button">Add to Database</button></td>')
                .on("click", function(){
                    $(this).closest ('tr').remove();
                    $.ajax({
        url: '/addEntry',
        type: 'POST',
        data: { json: JSON.stringify(trackArr[i])},
        dataType: 'json',
        success: function() { console.log('Database add success'); },
        error: function(jqXHR,error, errorThrown) {  
               if(jqXHR.status&&jqXHR.status==400){
                    alert(jqXHR.responseText); 
               }else{
                   alert("Something went wrong");
               }
    }
    });
            });
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