// Function to update the table and map with geolocation data
function updateGeolocation(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const speed = position.coords.speed || 0;
    const altitude = position.coords.altitude || 0;
    const accuracy = position.coords.accuracy || 0;

    // Update table data
    document.getElementById('latitude').textContent = latitude.toFixed(6);
    document.getElementById('longitude').textContent = longitude.toFixed(6);
    document.getElementById('speed').textContent = speed.toFixed(2);
    document.getElementById('altitude').textContent = altitude.toFixed(2);
    document.getElementById('accuracy').textContent = accuracy.toFixed(2);

    // Get address from OpenWeatherMap API
    fetch(`https://app.owm.io/app/1.1/geo/reverse?lat=${latitude}&lon=${longitude}&appid=dd8770c04bfc20b2f1885e5f1c901125&deviceid=011006FD-129A-458E-8A98-7283010A3558`)
        .then(response => response.json())
        .then(data => {
            const address = data.display_name || 'N/A';
            document.getElementById('address').textContent = address;

            // Check if device has moved (you may need to implement this logic)
            const hasMoved = true; // Replace with your logic

            // If the device has moved, post JSON response to another server
            if (hasMoved) {
                const postData = {
                    latitude,
                    longitude,
                    speed,
                    altitude,
                    accuracy,
                    address
                };

                // Perform an HTTP POST request to your server (https://static.blitzd.uk:1880/data/geolocation)
                // You can use the Fetch API or another library to make the POST request.
                // Example:
                // fetch('https://static.blitzd.uk:1880/data/geolocation', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json'
                //     },
                //     body: JSON.stringify(postData)
                // })
                // .then(response => {
                //     // Handle the response as needed
                // })
                // .catch(error => {
                //     console.error('Error:', error);
                // });
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // Update the map with a marker
    const map = L.map('map').setView([latitude, longitude], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = L.marker([latitude, longitude]).addTo(map);
}

// Function to handle errors in geolocation
function handleGeolocationError(error) {
    console.error('Geolocation error:', error.message);
}

// Start watching for geolocation updates
const watchOptions = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000
};

const watchId = navigator.geolocation.watchPosition(updateGeolocation, handleGeolocationError, watchOptions);
