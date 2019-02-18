var reader; //GLOBAL File Reader object for demo purpose only

/**
 * Check for the various File API support.
 */
function checkFileAPI() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        reader = new FileReader();
        return true;
    } else {
        alert('The File APIs are not fully supported by your browser. Fallback required.');
        return false;
    }
}

/**
 * read text input
 */
function readText(filePath) {
    var output = ""; //placeholder for text output
    if (filePath.files && filePath.files[0]) {
        reader.onload = function(e) {
            output = e.target.result;
            displayContents(output);
        }; //end onload()
        reader.readAsText(filePath.files[0]);
    } //end if html5 filelist support
    else if (ActiveXObject && filePath) { //fallback to IE 6-8 support via ActiveX
        try {
            reader = new ActiveXObject("Scripting.FileSystemObject");
            var file = reader.OpenTextFile(filePath, 1); //ActiveX File Object
            output = file.ReadAll(); //text contents of file
            file.Close(); //close file "input stream"
            displayContents(output);
        } catch (e) {
            if (e.number == -2146827859) {
                alert('Unable to access local files due to browser security settings. ' +
                    'To overcome this, go to Tools->Internet Options->Security->Custom Level. ' +
                    'Find the setting for "Initialize and script ActiveX controls not marked as safe" and change it to "Enable" or "Prompt"');
            }
        }
    } else { //this is where you could fallback to Java Applet, Flash or similar
        return false;
    }
    return true;
}

/**
 * display content using a basic HTML replacement
 */
function displayContents(txt) {
    var el = document.getElementById('main');
    el.innerHTML = txt; //display output in DOM
    setTimeout(autoCat,2000);
}

/*
// This is to use Lamina's API

function autoCat() {
  var request = new XMLHttpRequest();
  request.open("POST", "https://api.lamina.xyz/v1/entity");
  request.setRequestHeader('Authorization', '8967bade63216d556b0a29520343144c');

  var body = new FormData();
  body.append('text', $("#main").text());

  request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);
        var entities = [];

        console.log(data);
        if (request.status >= 200 && request.status < 400) {
            data.entities.forEach(tag => {
              if (tag.entity = "ORG"){
                entities.push(tag.text);
                console.log(tag.text);
              }
            });
        }
      console.log(entities);
      $("#tags").text(entities);
  }

  request.send(body);
}
*/

/*
// This is to use TextRazor
function autoCat() {
  var request = new XMLHttpRequest();
  request.open("POST", "https://api.textrazor.com");
  request.setRequestHeader('X-TextRazor-Key', '44f5dc63c24abf0999b3175afc9d64d5e15cb583e9ca9975a580c0fe');

  var body = new FormData();
  body.append('text', $("#main").text());

  request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);
        var entities = [];

        console.log(data);
        if (request.status >= 200 && request.status < 400) {
            data.entities.forEach(tag => {
              if (tag.entity = "ORG"){
                entities.push(tag.text);
                console.log(tag.text);
              }
            });
        }
      console.log(entities);
      $("#tags").text(entities);
  }

  request.send(body);
}
*/
function autoCat() {
  $.post( "https://api.textrazor.com", { 
    'apiKey': '44f5dc63c24abf0999b3175afc9d64d5e15cb583e9ca9975a580c0fe', 
    'extractors': 'entities',
    'entities.filterDbpediaTypes': 'Company, Organisation',
    'entities.filterFreebaseTypes': '/organization/organization',
    'text': $("#main").html()
  })
  .done(function( data ) {

      var result = data.response.entities;
      console.log(result[0]);
      var entities = [];

      result.forEach(tag => {
        //if (tag.confidenceScore > 1) {
            entities.push(tag.entityId);
            //console.log(tag.entityId);
        //}
      });

      var uniqueNames = [];
      $.each(entities, function(i, el){
      if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
      });
          
        //console.log(entities);
        uniqueNames.forEach(entity => {
          $("#tags").append("<li>" + entity + "</li>");
        })

        $("#main").html("");
    });
}

/*

$( "#submitURL" ).click(function() {
  const request = new XMLHttpRequest();
  request.open("GET", "http://api.scraperapi.com/?key=cdf6002b72c59aa5ef4cb41fa01408c9&url=" + $( "#urlID" ).val());
  request.send();

  request.onreadystatechange=function(){
    if(this.readyState==4 && this.status==200){
      $( "#pageContent" ).html(request.responseText).change();
      console.log($("#pageContent").val());
    }
  }
});

$( "#pageContent" ).change(function() {
  console.log("Change!");
  const request2 = new XMLHttpRequest();
  request2.open("POST", "https://api.lamina.xyz/v1/entity");
  request2.setRequestHeader('Authorization', '8967bade63216d556b0a29520343144c');
  request2.setRequestHeader('text', $("#pageContent").text());

  
  request2.send();

  request2.onreadystatechange=function(){
    if(this.readyState==4 && this.status==200){
      $( "#tags" ).html(request2.responseText);
      console.log(request2.responseText);
    }
  }
});

*/

$("#submitURL").click(function() {
    const request2 = new XMLHttpRequest();
    request2.open("POST", "https://api.lamina.xyz/v1/entity");
    request2.setRequestHeader('Authorization', '8967bade63216d556b0a29520343144c');
    request2.setRequestHeader('text', $("#pageContent").text());

    request2.send();

    request2.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            $("#tags").html(request2.responseText);
            console.log(request2.responseText);
        }
    }
});