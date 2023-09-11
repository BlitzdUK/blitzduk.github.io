// Function to get geolocation
function getGeolocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    resolve({ latitude, longitude });
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error("Geolocation is not available in this browser."));
        }
    });
}

// Function to make an HTTP GET request to OpenWeatherMap API
function getWeatherData(latitude, longitude) {
    const apiKey = "dd8770c04bfc20b2f1885e5f1c901125";
    const apiUrl = `https://app.owm.io/app/1.1/geo/reverse?lat=${latitude}&lon=${longitude}&appid=${apiKey}&deviceid=011006FD-129A-458E-8A98-7283010A3558`;

    return fetch(apiUrl)
        .then((response) => response.json())
        .catch((error) => console.error("Error fetching weather data:", error));
}

// Function to check if the device has moved (you can define your own logic)
function hasDeviceMoved(oldCoords, newCoords) {
    // You can implement your own logic here
    // For example, you can check if the new coordinates are significantly different from the old ones.
    return true;
}

// Function to post JSON response to another server
function postDataToServer(data) {
    if (hasDeviceMoved(oldCoordinates, data.coordinates)) {
        const postUrl = "https://static.blitzd.uk:1880/data/geolocation";

        fetch(postUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((result) => console.log("Data posted successfully:", result))
            .catch((error) => console.error("Error posting data:", error));
    }
}

// Initialize the process
let oldCoordinates = null;

getGeolocation()
    .then((coordinates) => {
        oldCoordinates = coordinates;
        document.getElementById("coordinates").innerText = `Latitude: ${coordinates.latitude}, Longitude: ${coordinates.longitude}`;
        return getWeatherData(coordinates.latitude, coordinates.longitude);
    })
    .then((weatherData) => {
        document.getElementById("weather-data").innerText = JSON.stringify(weatherData, null, 2);
        postDataToServer({ coordinates: oldCoordinates, weatherData });
    })
    .catch((error) => console.error("Error:", error));
