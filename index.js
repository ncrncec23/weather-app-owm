import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = 'https://api.openweathermap.org/data/2.5/'

// Global variables
let currentWeather;

// Serving static files from the 'public' directory
app.use(express.static('public'));

// Middleware to parse JSON and URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.sendFile("index.html");
});

// Route to render the main page
app.get('/weather', (req, res) => {
    if (!currentWeather) {
        currentWeather = getDefaultWeather();
    }
    res.render("index.ejs", { weather: currentWeather });
});

// Route for making the API call and sending it back to fetch from the frontend.
app.post('/location', async (req, res) => {
    const { latitude, longitude } = req.body;
    try {
        // API Call by Axios to OpenWeatherMap API
        const response = await axios.get(`${API_URL}weather`, {
            params: {
                lat: latitude,
                lon: longitude,
                appid: process.env.API_KEY,
                units: 'metric',
                lang: 'hr'
            }
        });
        currentWeather = await handleResponse(response); // This part of code handles the creation of an object from axios response
    } catch (error) {
        console.log(error.message);
    }
    res.json(currentWeather);
})

// Backend proxy for OpenWeatherMap temperature tiles
app.get('/tiles/temp/:z/:x/:y.png', async (req, res) => {
    const { z, x, y } = req.params;
    const key = process.env.API_KEY;

    const url = `https://tile.openweathermap.org/map/temp_new/${z}/${x}/${y}.png?appid=${key}`;

    try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/png');
        res.send(Buffer.from(buffer));
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching tile');
    }
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

// User defined functions
// **********************

// Function to get default weather when user didnt allow the location
function getDefaultWeather() {
    return {
        description: 'N/A',
        icon: '01d',
        temp: 0,
        feels_like: 0,
        temp_min: 0,
        temp_max: 0,
        pressure: 0,
        humidity: 0,
        wind_speed: 0,
        cloudiness: 0,
        sunrise: '00:00',
        sunset: '00:00',
        curTime: '00:00',
        name: 'Nepoznata lokacija',
        country: 'NN'
    }
}

async function handleResponse(response) {
    // Making the first letter in description uppercase
    let desc = response.data.weather[0].description;
    let uppperDesc = desc.charAt(0).toUpperCase() + desc.slice(1);

    // Getting UNIX time data
    const sunriseUnix = response.data.sys.sunrise;
    const sunsetUnix = response.data.sys.sunset;
    const currentTimeUnix = response.data.dt

    // Local time
    const sunriseTime = new Date(sunriseUnix * 1000).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date(sunsetUnix * 1000).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
    const currentTime = new Date(currentTimeUnix * 1000).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });

    // Creating personal Object for EJS template
    return {
        description: uppperDesc,
        icon: response.data.weather[0].icon,
        temp: Math.round(response.data.main.temp),
        feels_like: Math.round(response.data.main.feels_like),
        temp_min: Math.floor(response.data.main.temp_min),
        temp_max: Math.round(response.data.main.temp_max),
        pressure: response.data.main.pressure,
        humidity: response.data.main.humidity,
        wind_speed: Math.round(response.data.wind.speed * 3.6),
        cloudiness: response.data.clouds.all,
        sunrise: sunriseTime,
        sunset: sunsetTime,
        curTime: currentTime,
        name: response.data.name,
        country: response.data.sys.country
    }
}


