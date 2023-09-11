// Function to fetch GPS data
function fetchGPSData() {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const speed = position.coords.speed || "N/A";
            const altitude = position.coords.altitude || "N/A";
            const accuracy = position.coords.accuracy || "N/A";

            // Display coordinates, speed, altitude, and accuracy
            document.getElementById("coordinates").textContent = `Coordinates: ${latitude}, ${longitude}`;
            document.getElementById("speed").textContent = `Speed: ${speed}`;
            document.getElementById("altitude").textContent = `Altitude: ${altitude}`;
            document.getElementById("accuracy").textContent = `GPS Accuracy: ${accuracy}`;

            // Fetch address using OpenWeatherMap API
            fetch(`https://app.owm.io/app/1.1/geo/reverse?lat=${latitude}&lon=${longitude}&appid=dd8770c04bfc20b2f1885e5f1c901125&deviceid=011006FD-129A-458E-8A98-7283010A3558`)
                .then((response) => response.json())
                .then((data) => {
                    const address = data.address || "N/A";
                    document.getElementById("address").textContent = `Address: ${address}`;

                    // Check if the device has moved significantly (adjust threshold as needed)
                    if (position.coords.accuracy <= 10) {
                        // If the device has moved, post JSON response to the specified URL
                        const postData = {
                            latitude,
                            longitude,
                            speed,
                            altitude,
                            accuracy,
                            address,
                        };

                        fetch("https://static.blitzd.uk:1880/data/geolocation", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(postData),
                        })
                            .then((response) => {
                                if (response.status === 200) {
                                    console.log("Data posted successfully.");
                                } else {
                                    console.error("Error posting data:", response.statusText);
                                }
                            })
                            .catch((error) => {
                                console.error("Error:", error);
                            });
                    }
                })
                .catch((error) => {
                    console.error("Error fetching address:", error);
                });
        }, (error) => {
            console.error("Error getting geolocation:", error.message);
        });
    } else {
        console.error("Geolocation is not available in this browser.");
    }
}

// Call the fetchGPSData function when the page loads
window.onload = fetchGPSData;
