var uvi;
var windSpeed;
var humidity;
var temp;
var currentIcon;
var city;
var currDate;
var cityIn;
var stateIn;

let userCity = document.getElementById("cityIn");
let userState = document.getElementById("stateIn");
let displayResults = document.getElementById("displayResults");
let locationIcon = document.querySelector(".weather-icon");
let historyUl = document.getElementById("history");
let fiveDay = document.getElementById("fiveDay");
let currWindText = document.getElementById("wind");
let currtempText = document.getElementById("temp");
let currHumidityText = document.getElementById("humidity");
let uviSpan = document.getElementById("uviSpan");

var places = [];

//click handler for cityButtons in the history list
$(".container").on("click", "button", function (event) {
  cityIn = $(this).text();
  stateIn = $(this).data("state");
  getCords();
});

function createHistory() {
  removeChildren(historyUl);
  //check that the places array has values stored
  if (places.length != 0) {
    //reverse the order of the places array to show last entered first
    var revPlaces = places.reverse();
    //loop through the revPlaces array and apply the following to each
    for (var i = 0; i < revPlaces.length; i++) {
      //create a button named cityButton
      var cityButton = $("<button>");
      //get the of each city from revPlaces and assign it to the text atttribute of the cityButton
      cityButton.text(revPlaces[i][0]);
      //add the class "cityButton" to the cityButton
      cityButton.addClass("cityButton");
      //add a data-state value to the button tag
      $(cityButton).data("state", revPlaces[i][1]);
      //add the cityButton to historyUl
      $(historyUl).append(cityButton);
    }
  }
}
//click handler for the search button
$("#search").click(function () {
  //ckeck that user entered data
  if (userCity.value.length == 0 || userState.value.length == 0) {
    //if none entered print to colsole.log
    console.log("Text box not filled in");
  } else {
    //assign the values found in the form fields to the appropriate variable, capitalizing as needed
    cityIn = capitalizeWord(userCity.value);
    stateIn = capitalizeState(userState.value);
    saveCity(cityIn, stateIn);
    getCords();
  }
});

function saveCity(cityIn, stateIn) {
  //check that places array has objects stored
  //if it does
  if (places.length != 0) {
    for (var i = 0; i < places.length; i++) {
      //check if city / state exsist in the places array
      if (places[i][0] === cityIn && places[i][1] === stateIn) {
        //remove current city entry from array
        places.splice(i, i + 1);
        //create a new object to be stored in the places array
        var tempArray = [cityIn, stateIn];
        //add to places array
        places.push(tempArray);
        //save to local storage
        localStorage.setItem("cities", JSON.stringify(places));
        //if city state does not exist
      } else {
        //same as above
        var tempArray = [cityIn, stateIn];
        places.push(tempArray);
        localStorage.setItem("cities", JSON.stringify(places));
      }
    }
    //if places array is empty
  } else {
    //same as above
    var tempArray = [cityIn, stateIn];
    places.push(tempArray);
    localStorage.setItem("cities", JSON.stringify(places));
  }
}

function displayWeather(timeStamp) {
  currDate = convertTime(timeStamp);
  //assign values to text fields
  $(currHumidityText).text("Humidity: " + humidity + "%");
  $(currWindText).text("Wind Speed: " + windSpeed + " KPH");
  $(currtempText).text("Temperature: " + temp + " C");
  $(uviSpan).text(uvi);
  checkUvi(uvi);
  var resultString =
    city + " (" + currDate + ") " + "<img src=icons/" + currentIcon + ".png>";
  displayResults.innerHTML = resultString;
}

function getHistory() {
  //call from local storage
  var result = localStorage.getItem("cities");
  //check that we received a result
  if (result != null) {
    //convert result to a JSON object
    var parseResult = JSON.parse(result);
    for (var i = 0; i < parseResult.length; i++) {
      //add each entry to places array
      places.push(parseResult[i]);
    }
    //if no result returned from localstorage (i.e. storage is empty)
  } else {
    console.log("cities not found");
  }
}

function getCords() {
  fetch(
    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      cityIn +
      ",+" +
      stateIn +
      "& key=AIzaSyAweIP9TjVJjtUjpbZuiu69BBoh9sMPMUc"
  ).then(function (response) {
    response.json().then(function (data) {
      //check response status
      //if status is ok
      if (data.status === "OK") {
        //currentLat = data.results[0].geometry.location.lat.toFixed(6);
        //currentlng = data.results[0].geometry.location.lng.toFixed(6);
        city = data.results[0].address_components[0].long_name;
        //if satus is not ok
      } else {
        console.log("*ERROR* " + data.status);
      }
      var tempPlace = [];
      var thisPlace = [cityIn, stateIn];
      tempPlace.push(thisPlace);
      localStorage.setItem("last", JSON.stringify(tempPlace));
      getWeather(
        data.results[0].geometry.location.lat.toFixed(6),
        data.results[0].geometry.location.lng.toFixed(6)
      );
    });
  });
}

function getWeather(currentLat, currentLng) {
  fetch(
    "https://api.openweathermap.org/data/3.0/onecall?lat=" +
      currentLat +
      "&lon=" +
      currentLng +
      "&units=metric&appid=969563e52dd1849b75c1e2ae4c33021f"
  ).then(function (response) {
    response.json().then(function (data) {
      //check if we recieved a good result
      if (data.current) {
        //get values from the data object and assign to variables
        uvi = data.current.uvi;
        temp = data.current.temp;
        windSpeed = data.current.wind_speed;
        humidity = data.current.humidity;
        currentIcon = data.current.weather[0].icon;

        displayWeather(data.current.dt);
        createHistory(data);
        showFiveDay(data);
        //if we did not get the expexted result
      } else {
        console.log(
          "*ERROR* Code:" + data.cod + " \n Message: " + data.message
        );
      }
    });
  });
}

// converts from UTC to local time stamp
function convertTime(timeStamp) {
  var date = new Date(timeStamp * 1000);
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  return (month + 1).toString() + "/" + day.toString() + "/" + year.toString();
}

// Capitalizes both letters in the state abbreviation
function capitalizeState(string) {
  return string[0].toUpperCase() + string.slice(1).toUpperCase();
}

//Capitalizes the first letter of the ciity name
function capitalizeWord(string) {
  return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

function showFiveDay(data) {
  //remove existing five day cards
  removeChildren(fiveDay);
  //make new five day cards
  for (var i = 1; i < 6; i++) {
    $(fiveDay).append(makeFiveDayCard(data, i));
  }
}

function makeFiveDayCard(data, index) {
  //create a colum
  let colum = $("<div>");
  //add class values
  $(colum).addClass("fiveDayCol col col-sm-4 col-md-6 col-lg-2 col-xl-2 mb-2");

  //create a card
  let card = $("<div>");
  //add the class "card" to the card
  $(card).addClass("card fiveDayCard");

  //create card header
  let dateText = $("<strong>");
  // add class "card-header" to cardHeader
  $(dateText).addClass("dateText");
  //assign date to cardHeader
  $(dateText).text(convertTime(data.daily[index].dt));

  //create a div for the icon
  let iconDiv = $("<img>");
  //display icon in iconDiv
  $(iconDiv).attr("src", "icons/" + data.daily[index].weather[0].icon + ".png");

  //create text elements for temp wind and humidity
  let tempText = $("<text>");
  let windtext = $("<text>");
  let humidText = $("<text>");
  //display corrisponding values
  $(tempText).text("Temp: " + data.daily[index].temp.max.toString() + " C");
  $(windtext).text("Wind: " + data.daily[index].wind_speed.toString() + " KPH");
  $(humidText).text("Humidity: " + data.daily[index].humidity.toString() + "%");

  //add header to card
  $(card).append(dateText);
  //add iconDiv to card
  $(card).append(iconDiv);
  //add temp wind and humidity to card
  $(card).append(tempText);
  $(card).append(windtext);
  $(card).append(humidText);
  //add card to column
  $(colum).append(card);
  return colum;
}

function removeChildren(parent) {
  //get all the children of the parent and store them as array
  var currentChildren = parent.children;
  //loop through the currentChildren array
  $(currentChildren).each(function () {
    //remove each child of the parent
    this.remove();
  });
}

//loads the last city viewed
function loadLast() {
  let raw = localStorage.getItem("last");
  //check that an object was returned
  if (raw != null) {
    //parse to a JSON object
    let result = JSON.parse(raw);
    //assign values
    cityIn = result[0];
    stateIn = result[1];
    getCords();
    //if there was no object returned
  } else {
    cityIn = "Toronto";
    stateIn = "ON";
    getCords();
  }
}

//set uvi span background colour
function checkUvi(uvi) {
  if (uvi <= 2) {
    uviSpan.style.backgroundColor = "green";
  } else if (uvi > 2 && uvi <= 5) {
    uviSpan.style.backgroundColor = "yellow";
  } else if (uvi > 5 && uvi <= 7) {
    uviSpan.style.backgroundColor = "orange";
  } else if (uvi > 7 && uvi <= 10) {
    uviSpan.style.backgroundColor = "red";
  } else if (uvi > 10) {
    uviSpan.style.backgroundColor = "violet";
  } else {
    console.log("bad input");
  }
}

getHistory();
createHistory();
