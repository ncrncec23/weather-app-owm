const defaultLocation = [45.815, 15.978]; // Default location: Zagreb

// Initizaliation of the map
const map = L.map('map').setView(defaultLocation, 6);

// Creation of the OpenStreetMap layer
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Creation of the OpenWeatherMap temperature layer
const tempLayer = L.tileLayer('/tiles/temp/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
}).addTo(map);

// Function for adding a marker to the map, by passing the current location and text displayed
function addMarker(lat, lon, popupText) {
    L.marker([lat, lon]).addTo(map)
        .bindPopup(popupText)
        .openPopup();
    map.setView([lat, lon], 6);
}

// Getting user location
navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    try {
        // Making the fetch API to the '/location' endpoint
        const response = await fetch('/location', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ latitude: lat, longitude: lon })
        })

        const data = await response.json() // Getting the JSON response of the backend

        // Adding marker to your current location with the name of the town/city
        addMarker(lat, lon, `Tvoja lokacija: ${data.name}`);

        manipulateDOM(data); // Displaying elements by manipulating DOM

    } catch (err) {
        console.error(err.message);
    }
}, () => {
    addMarker(...defaultLocation, "Zagreb");
});

// Integration of the layers to the map
L.control.layers({ "OSM": osmLayer, "Temperature": tempLayer }).addTo(map);

const form = document.getElementById("search-form");
form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Preventing the default behavior of the form submission
    const formData = new FormData(form);
    const json = Object.fromEntries(formData.entries()); // Getting the form data as JSON object
    try {
        const response = await fetch('/search', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(json)
        })
        const data = await response.json(); // Getting the JSON response of the backend
        addMarker(data.lat, data.lon, `Tvoja lokacija: ${data.name}`);
        manipulateDOM(data); // Displaying elements by manipulating DOM
        form.reset(); // Resetting the form
    } catch (err) {
        console.error(err.message);
    }
});

// function for manipulating DOM after the fetch API call
function manipulateDOM(data) {
    document.getElementById("icon").setAttribute("src", `https://openweathermap.org/img/wn/${data.icon}@2x.png`);
    document.querySelector(".description").innerHTML = data.description;
    document.querySelector(".city-name").innerHTML = `${data.name}, ${data.country}`;
    document.querySelector(".temperature").innerHTML = data.temp + " °C";
    document.querySelector(".seems-like").innerHTML = `Čini se kao: ${data.feels_like}°C`;
    document.querySelector(".temperature-max").innerHTML = `${data.temp_max}°C`;
    document.querySelector(".temperature-min").innerHTML = `${data.temp_min}°C`;
    document.querySelectorAll(".bg-value")[0].innerHTML = `${data.pressure} <span class="hpa">hPa</span>`
    document.querySelectorAll(".bg-value")[1].innerHTML = `${data.humidity} %`
    document.querySelectorAll(".bg-value")[2].innerHTML = `${data.cloudiness} %`
    document.querySelectorAll(".bg-value")[3].innerHTML = `${data.wind_speed} <span class="hpa">km/h</span>`

    // Check if it is day or night to dynamically change the background
    if (data.curTime >= data.sunrise && data.curTime < data.sunset) {
        const url = "../images/SunnyDay.png";
        document.querySelector(".current-weather").style.setProperty("--weather-bg", `url(${url})`);
    } else {
        const url = "../images/Night.png"
        document.querySelector(".current-weather").style.setProperty("--weather-bg", `url(${url})`);
        document.querySelector(".city-name").style.color = "white";
        document.querySelector(".temperature").style.color = "#e85b2d";
        document.querySelector(".seems-like").style.color = "white";
    }
}