     (function() {
         "use strict";
         
         var main = function() {
        var noPlaylist=false;
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
        /**
        *DATABASE ADD HELPER
        *Add to database, remove table row
        *@return void
        */
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
          
        /**
        *DATABASE QUERY HELPER
        *Get docs from database, add delete button
        *@return void
        */
        function getAll () {
            var req = new XMLHttpRequest();
            req.open('GET', 'http://localhost:8888/getEntry');
            req.onreadystatechange = function (oEvent) {  
        if (req.readyState === 4) {  
            if (req.status === 200) {  
                console.log("CLI: Find success");
                displayDB(JSON.parse(req.responseText));
            } else {  
           console.log("CLI: Find error");  
            }
        }
        };
        req.send();
        }
        /**
        *DATABASE TABLE CREATOR
        *Display docs from database
        *@return void
        */
        function displayDB (data) {
            var $dataTable = $('<table border="1" class="temp_search">');
            $("personal-playlist").append("<p>Your saved tracks: ");
            $dataTable.append('<tr class="srtch-header"><th class="srch-art">Album Art</th><th class="srch-artist">Artist</th><th class="srch-          album">Album</th><th class="srch-track">Track</th><th class="srch-add">Delete</th></tr>');
            $.each(data, function(index, value) {
            var $tableRow = $('<tr  class="srtch-result">');     
            $tableRow.append('<td><img src = ' + value.albumArt +'></td>');
            $tableRow.append('<td class="srch-data">' + value.artist + '</td>');
            $tableRow.append('<td class="srch-data">' + value.album + '</td>');
            $tableRow.append('<td class="srch-data">' + value.name + '</td>');
            
            //REMOVE FROM DBASE BUTTON FOR THIS TRACK
            var $tableData = $('<td class="srch-data">');
            var $remButton = $('<button/>')
                .text('Delete')
                .addClass('srch-data-btn')
                .off().on("click", function() {removeEntry(this, value)});
            $tableData.append($remButton);  
            $tableRow.append($tableData);

            $dataTable.append($tableRow);
            });
        $('#personal-playlist').empty();
        $('#personal-playlist').append($dataTable);
    
        }

          
        /**SEARCH BUTTON HANDLER
        * Searches spotify API for song
        * @return void
        */
        function runSearch(searchVal) {     
       
    //CREATE TABLE
   var $responseTable = $('<table border="1" class="temp_search">');
    //CALL TO Spotify API
    $.getJSON("https://api.spotify.com/v1/search?q="+searchVal+"&type=track&market=US",
        function(data){
        var trackArr = data.tracks.items;
        //console.log(trackArr); //prints results to console
        
        //clear old results
        $('#search-results').empty();
        
        $('#search-results').append("<p>Spotify found: ");
        
        //TABLE HEADER
        $responseTable.append('<tr class="srtch-header"><th class="srch-art">Album Art</th><th class="srch-artist">Artist</th><th class="srch-          album">Album</th><th class="srch-track">Track</th><th class="srch-preview">Preview</th><th class="srch-add">Add To Database</th></tr>');
    
        //ITERATE OVER SEARCH RESULTS
        $.each(trackArr, function(index, track) {
            //ADD IMAGE/DEETS TO TABLE
            
            var $tableRow = $('<tr  class="srtch-result">');
            $tableRow.append('<td><img src = ' + track.album.images[track.album.images.length-1].url+'></td>');
            $tableRow.append('<td class="srch-data">' + track.artists[0].name + '</td>');
            $tableRow.append('<td class="srch-data">' + track.album.name + '</td>');
            $tableRow.append('<td class="srch-data">' + track.name + '</td>');
            
            //PREVIEW BUTTON FOR THIS TRACK
            var $tableData = $('<td class="srch-data">');
            var $playButton = $('<button/>')
                .text('Preview')
                .addClass('srch-data-btn');
            var $playAnchor = $('<a/>')
                .attr('href', track.preview_url)
                .attr('target', 'blank');
            $playAnchor.append($playButton);
            $tableData.append($playAnchor);  
            $tableRow.append($tableData);
            $tableData = $('<td class="srch-data">');
            
            //ADD TO DBASE BUTTON FOR THIS TRACK
            var $addButton = $('<button/>')
                .text('Store')
                .addClass('srch-data-btn')
                .off().on("click", function() {addEntry(this, track)});
            $tableData.append($addButton);  
            $tableRow.append($tableData);

            $responseTable.append($tableRow);
        });

        $('#search-results').append($responseTable);
        $('#collapseOne').collapse('hide');
        $('#collapseTwo').collapse('show');
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
      
  
            //get user's info  
    $.ajax({
    url: 'https://api.spotify.com/v1/me',
    headers: {'Authorization': 'Bearer ' + access_token},
    success: function(response) {
                    
                          //we have the token, init playlist
        var url = 'https://api.spotify.com/v1/users/' + response.id +'/playlists';
	$.ajax(url, {
		method: 'GET',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + access_token,
			'Content-Type': 'application/json'
		},
		success: function(r) {
			console.log('CLI: PLAYLIST LOOKUP RESPONSE', r);
            var playlists = JSON.stringify(r);
            if (playlists.indexOf("Web App")>-1) {
                console.log('CLI: PLAYLIST ALREADY CREATED');
                //nothing further, then
            } else { noPlaylist = true;
		}},
		error: function(r) {
			consloe.log("CLI: ERROR ON PLAYLIST LOOKUP");
		}
	}).done(function() {
        if (noPlaylist) {
            	$.ajax(url, {
		method: 'POST',
		data: JSON.stringify({
			'name': 'Web App Playlist',
			'public': true
		}),
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + access_token,
			'Content-Type': 'application/json'
		},
		success: function(r) {
			console.log('CLI: PLAYLIST CREATE RESPONSE', r);
		},
		error: function(r) {
			consloe.log("CLI: ERROR CREATING PLAYLIST");
		}
	});
    }});


                  userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                
                //attach search button handler once we're logged in
                $('#searchButton').on('click', function () {
                runSearch($('#searchVal').val());
                });
                  //user is logged in, show details
                $('#accordion').show();
             
                $('#collapseThree').on('show.bs.collapse', function() { //fix
                    $('#collapseTwo').collapse('hide');
                    $('#collapseOne').collapse('hide');
                    getAll(this);
                });
                $('#collapseTwo').on('show.bs.collapse', function() {
                    $('#collapseOne').collapse('hide');
                    $('#collapseThree').collapse('hide');
                });
                     $('#collapseOne').on('show.bs.collapse', function() {
                    $('#collapseTwo').collapse('hide');
                    $('#collapseThree').collapse('hide');
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