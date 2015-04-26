//The main function is for testing. Should probably be replaced with a search button listener that will exicute the getJSON function.

var main = function(){

var trackArr,
    //Creates a table with some basic styling. May need to remove the styling
    $responseTable = $('<table border="1" style="width:100%">'),
    //track should be assigned by search parameter.
    track = "Pyro";
//function that searches the Spotify API
$.getJSON("https://api.spotify.com/v1/search?q="+track+"&type=track&market=US",
    function(data){
        trackArr = data.tracks.items;
        console.log(trackArr);
        $body = $('body');
        $body.append("<p>Spotify found: ");
    
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
                        $.post('/addEntry', trackArr[i])
                            .done(function() { console.log('Database success');})
                                .fail(function () { console.log('Didnt work');})
                                
                                
                    
 
            });
            $responseTable.append($tableRow);
        }

        $body.append($responseTable);
        
    });
};

$(document).ready(main);