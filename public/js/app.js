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

        // Making the fetch API to the '/forecast' endpoint
        const forecastResponse = await fetch('/forecast', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ latitude: lat, longitude: lon })
        });

        const data = await response.json() // Getting the JSON response of the backend
        const forecastData = await forecastResponse.json(); // Getting the JSON forecastData of the backend

        // Adding marker to your current location with the name of the town/city
        addMarker(lat, lon, `Tvoja lokacija: ${data.name}`);

        manipulateDOM(data); // Displaying elements by manipulating DOM
        manipulateForecastDOM(forecastData); // Displaying forecast data by manipulating DOM
    } catch (err) {
        console.error(err.message);
    }
}, () => {
    addMarker(...defaultLocation, "Zagreb");
});

// Integration of the layers to the map
L.control.layers({ "OSM": osmLayer, "Temperature": tempLayer }).addTo(map);

const form = document.getElementById("search-form"); // Getting the form element

form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Preventing the default behavior of the form submission
    const formData = new FormData(form);
    const json = Object.fromEntries(formData.entries()); // Getting the form data as JSON object
    try {
        // Making the fetch API to the '/search' endpoint
        const response = await fetch('/search', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(json)
        })

        // Making the fetch API to the '/search-forecast' endpoint
        const responseForecast = await fetch('/search-forecast', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(json)
        });

        const data = await response.json(); // Getting the JSON response of the backend
        const forecastData = await responseForecast.json(); // Getting the JSON forecastData of the backend
        addMarker(data.lat, data.lon, `Tvoja lokacija: ${data.name}`);
        manipulateDOM(data); // Displaying elements by manipulating DOM
        manipulateForecastDOM(forecastData); // Displaying forecast data by manipulating DOM
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

// Function for manipulating DOM for forecast data
function manipulateForecastDOM(forecastData) {
    const dates = Object.keys(forecastData);
    document.querySelectorAll(".accordion-item").forEach((item, index) => {
        const dateKey = dates[index];
        item.querySelector(".date").innerHTML = formatDateShort(dateKey);
        item.querySelector(".long-date").innerHTML = capitalizeFirst(formatDateLong(dateKey));
        let target = forecastData[dateKey].find(el => el.dt_txt.endsWith("12:00:00"));
        if (!target) target = forecastData[dateKey][0]; // Fallback to the first entry if 12:00:00 is not found
        item.querySelector(".weather-forecast-icon").setAttribute("src", `https://openweathermap.org/img/wn/${target.weather[0].icon}@2x.png`);
        item.querySelector(".cels").innerHTML = `${Math.round(target.main.temp)}°C`;
        item.querySelector(".hour-description").innerHTML = target.weather[0].description.charAt(0).toUpperCase() + target.weather[0].description.slice(1);

        item.querySelector(".wind_speed").innerHTML = `${Math.round(target.wind.speed * 3.6)} km/h`;
        item.querySelector(".pressure-ground").innerHTML = `${target.main.pressure} hPa`;
        item.querySelector(".humidity-level").innerHTML = `${target.main.humidity} %`;
        item.querySelector(".cloudiness-level").innerHTML = `${target.clouds.all} %`;
        const rain = target.rain?.["3h"] ?? target.rain?.["1h"] ?? 0;
        item.querySelector(".rain-level").innerHTML = `${rain} mm`;

        const now = new Date();
        const todayKey = now.toISOString().split("T")[0]; // npr. "2025-08-28"

        item.querySelectorAll(".hourly-scroll .card-border").forEach((card) => {
            const hourEl = card.querySelector(".hours");
            const tempEl = card.querySelector(".degree-bold");
            const iconEl = card.querySelector(".f-ico");

            // izdvoji samo sat iz HTML-a
            const hourText = hourEl.textContent.split(":")[0].padStart(2, "0");

            let forecast;

            if (dateKey === todayKey) {
                forecast = forecastData[dateKey].find(el =>
                    el.dt_txt.endsWith(`${hourText}:00:00`)
                );
                if (forecast) {
                    tempEl.innerHTML = `${Math.round(forecast.main.temp)}°C`;
                    iconEl.src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
                    iconEl.alt = forecast.weather[0].description;
                }
            } else {
                forecast = forecastData[dateKey].find(el =>
                    el.dt_txt.endsWith(`${hourText}:00:00`)
                );
                if (forecast) {
                    tempEl.innerHTML = `${Math.round(forecast.main.temp)}°C`;
                    iconEl.src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
                    iconEl.alt = forecast.weather[0].description;
                }
            }
        });
    })
}

// Function for formatting date to a short format
function formatDateShort(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("hr-HR", {
        weekday: "short", // Ned, Pon, Uto...
        day: "numeric",   // 10, 27...
        month: "short"    // sij, velj, ožu, tra, svi, lip, srp, kol, ruj, lis, stu, pro
    }).format(date);
}

// Function for formatting date to a long format
function formatDateLong(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("hr-HR", {
        weekday: "long",  // Nedjelja, Ponedjeljak, Utorak...
        day: "numeric",   // 10, 27...
        month: "long",    // siječnja, veljače, ožujka, travnja, svibnja, lipnja, srpnja, kolovoza, rujna, listopada, studenoga, prosinca
        year: "numeric"   // 2023, 2024...
    }).format(date);
}

// Function to capitalize the first letter of a string
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}