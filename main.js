var reader; //GLOBAL File Reader object for demo purpose only
var stringFromCharCode = String.fromCharCode;

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
    'cleanup.returnRaw': 'true',
    'cleanup.mode': 'cleanHTML',
    'text': utf8encode($("#main").html())
  })
  .done(function( data ) {

      var result = data.response.entities;
      //console.log(result[0]);
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
          $("#tags").append("<li><a target='_blank' href='http://en.wikipedia.org/wiki/" + entity + "'>" + entity + "</a></li>");
        })

    });
}

function utf8encode(string) {
        var codePoints = ucs2decode(string);
        var length = codePoints.length;
        var index = -1;
        var codePoint;
        var byteString = '';
        while (++index < length) {
            codePoint = codePoints[index];
            byteString += encodeCodePoint(codePoint);
        }
        return byteString;
    }

function encodeCodePoint(codePoint) {
        if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
            return stringFromCharCode(codePoint);
        }
        var symbol = '';
        if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
            symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
        }
        else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
            checkScalarValue(codePoint);
            symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
            symbol += createByte(codePoint, 6);
        }
        else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
            symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
            symbol += createByte(codePoint, 12);
            symbol += createByte(codePoint, 6);
        }
        symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
        return symbol;
    }

function ucs2decode(string) {
        var output = [];
        var counter = 0;
        var length = string.length;
        var value;
        var extra;
        while (counter < length) {
            value = string.charCodeAt(counter++);
            if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                // high surrogate, and there is a next character
                extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) { // low surrogate
                    output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                } else {
                    // unmatched surrogate; only append this code unit, in case the next
                    // code unit is the high surrogate of a surrogate pair
                    output.push(value);
                    counter--;
                }
            } else {
                output.push(value);
            }
        }
        return output;
    }

function checkScalarValue(codePoint) {
        if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
            throw Error(
                'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
                ' is not a scalar value'
            );
        }
    }

function createByte(codePoint, shift) {
        return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
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