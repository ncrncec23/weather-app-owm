const defaultLocation = [45.815, 15.978]; // Default location (Zagreb)

const map = L.map('map').setView(defaultLocation, 6);

// OSM layer
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// OpenWeatherMap temperature layer implemented by the backend proxy
const tempLayer = L.tileLayer('/tiles/temp/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
}).addTo(map);

// Function to add a marker to the map
function addMarker(lat, lon, popupText) {
    L.marker([lat, lon]).addTo(map)
        .bindPopup(popupText)
        .openPopup();
    map.setView([lat, lon], 6);
}

// Get user's location and sending it to the server
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Adding marker to the map
        addMarker(lat, lon, "Tvoja lokacija");

        // Send location data to the server
        try {
            await fetch('/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: lat, longitude: lon })
            });
        } catch (err) {
            console.error("Error sending location data:", err);
        }
    }, () => {
        addMarker(...defaultLocation, "Zagreb");
    });
} else {
    addMarker(...defaultLocation, "Zagreb");
}

// Layer control
L.control.layers({ "OSM": osmLayer, "Temperature": tempLayer }).addTo(map);