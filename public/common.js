console.log('Loading common.js functions');

// Function to get the Parameter Value from URL
function parseURLParameter(parameter) {
  var fullURL = window.location.search.substring(1);
  var paramsArray = fullURL.split("&");
  for (var i=0;i<paramsArray.length;i++) {
    var currentParam = paramsArray[i].split("=");
    console.log("CurrentParam : ", currentParam[0]);
    if (currentParam[0] == parameter) {
        return currentParam[1];
    }
  }
  alert('Parameter Variable ' + parameter + ' not found');
};

function cookie() {
  console.log('Cookie: Called');
  var cookies = {};
  if (document.cookie && document.cookie != '') {
    var split = document.cookie.split(';');
    for (var i = 0; i < split.length; i++) {
      var name_value = split[i].split("=");
      return(name_value[1]);
    }
  }
};
