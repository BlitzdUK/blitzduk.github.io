// Function to fetch the public IP address
        async function fetchPublicIP() {
            try {
                // Fetch IP address from ipify API
                let response = await fetch('https://api.ipify.org?format=json');
                let data = await response.json();
                return data.ip;
            } catch (error) {
                console.error('Error fetching IP address:', error);
                return null;
            }
        }

        // Function to send IP address to the server
        async function sendIPToServer(ip) {
            try {
                let response = await fetch('http://blitzd.gotdns.ch:1880/streetcred', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ip: ip })
                });
                
                if (response.ok) {
                    console.log('IP address sent successfully:', ip);
                } else {
                    console.error('Error sending IP address:', response.statusText);
                }
            } catch (error) {
                console.error('Error sending IP address:', error);
            }
        }

        // When the page loads, fetch the IP address and send it to the server
        window.onload = async () => {
            let ip = await fetchPublicIP();
            if (ip) {
                await sendIPToServer(ip);
            }
        }
