// Get references to HTML elements
const table = document.querySelector('table');
const mapDiv = document.getElementById('map');

// Initialize the map
const mymap = L.map(mapDiv).setView([0, 0], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(mymap);

let previousCoords = null;

// Function to update the table and send data to the server
function updateTableAndSendData(position) {
    const { coords, timestamp } = position;
    const { latitude, longitude, speed, altitude, accuracy } = coords;

    // Check if the device has moved
    if (previousCoords && previousCoords.latitude === latitude && previousCoords.longitude === longitude) {
        return;
    }

    previousCoords = { latitude, longitude };

    // Display coordinates, speed, altitude, and GPS accuracy in the table
    const row = table.insertRow(1);
    row.innerHTML = `
        <td>${latitude.toFixed(6)}, ${longitude.toFixed(6)}</td>
        <td>${speed ? speed.toFixed(2) : 'N/A'} m/s</td>
        <td>${altitude ? altitude.toFixed(2) : 'N/A'} meters</td>
        <td>${accuracy ? accuracy.toFixed(2) : 'N/A'} meters</td>
    `;

    // Create a marker on the map
    const marker = L.marker([latitude, longitude]).addTo(mymap);
    marker.bindPopup(`Speed: ${speed} m/s<br>Altitude: ${altitude} meters<br>GPS Accuracy: ${accuracy} meters`);
    mymap.setView([latitude, longitude], 13);

    // Send data to the server
    fetch(`https://app.owm.io/app/1.1/geo/reverse?lat=${latitude}&lon=${longitude}&appid=dd8770c04bfc20b2f1885e5f1c901125&deviceid=011006FD-129A-458E-8A98-7283010A3558`)
        .then(response => response.json())
        .then(data => {
            // Check if the device has moved again before sending the data
            if (previousCoords && previousCoords.latitude === latitude && previousCoords.longitude === longitude) {
                return;
            }

            // Send the data to the server using a POST request
            fetch('https://static.blitzd.uk:1880/data/geolocation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timestamp,
                    coordinates: { latitude, longitude },
                    speed,
                    altitude,
                    accuracy,
                    address: data.display_name,
                }),
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Start watching for position changes
const watchId = navigator.geolocation.watchPosition(updateTableAndSendData, error => {
    console.error('Error getting GPS data:', error);
}, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000,
});

// Stop watching when the page is unloaded
window.addEventListener('unload', () => {
    navigator.geolocation.clearWatch(watchId);
});
