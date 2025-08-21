import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Global variables
let lastLocation = null;

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
    res.render("index.ejs");
});

// Route to handle location data sent from the client
app.post('/location', (req, res) => {
    const { latitude, longitude } = req.body;
    lastLocation = { latitude, longitude };
    res.sendStatus(200);
});

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
