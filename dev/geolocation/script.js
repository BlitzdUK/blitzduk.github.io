// Function to get the current date and time in the desired format
function getCurrentDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB'); // dd/mm/yy format
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false }); // hh:mm:ss format
    return `${timeStr} - ${dateStr}`;
}

// Function to send a POST request to the server
function sendDataToServer(data) {
    // Check if the device has moved (you can implement this logic)
    const deviceHasMoved = true; // Replace with your logic to determine movement

    if (deviceHasMoved) {
        fetch('https://static.blitzd.uk:1880/data/geolocation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (response.ok) {
                console.log('Data successfully posted to the server.');
            } else {
                console.error('Failed to post data to the server.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

// Function to handle geolocation updates
function handleLocationUpdate(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const altitude = position.coords.altitude;
    const timestamp = getCurrentDateTime();

    const data = {
        latitude,
        longitude,
        altitude,
        timestamp,
    };

    document.getElementById('geolocation-data').innerHTML = `
        <p>Latitude: ${latitude}</p>
        <p>Longitude: ${longitude}</p>
        <p>Altitude: ${altitude} meters</p>
        <p>Timestamp: ${timestamp}</p>
    `;

    sendDataToServer(data);
}

// Function to handle geolocation errors
function handleLocationError(error) {
    console.error('Error getting geolocation:', error.message);
}

// Start watching the device's geolocation
const watchId = navigator.geolocation.watchPosition(
    handleLocationUpdate,
    handleLocationError
);
