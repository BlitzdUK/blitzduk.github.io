
        document.addEventListener("DOMContentLoaded", function() {
            // Fetch user's IP address
            fetch('https://api.ipify.org/?format=json')
            .then(response => response.json())
            .then(data => {
                const ipAddress = data.ip;
                
                // Fetch IP details
                fetch(`https://api.ipstack.com/${ipAddress}?access_key=dc636aa2bdb6431961ac16273ebaf3d1`)
                .then(response => response.json())
                .then(data => {
                    const countryCode = data.country_code;

                    // Redirect if country code is not GB
                    if (countryCode !== 'GB') {
                        window.location.href = 'https://blitzd.uk/gatekeeper'; // Redirect URL here
                    }
                })
                .catch(error => {
                    console.error('Error fetching IP details:', error);
                });
            })
            .catch(error => {
                console.error('Error fetching IP address:', error);
            });
        });
    