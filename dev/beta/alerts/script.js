document.addEventListener("DOMContentLoaded", function () {
    // Make an AJAX request to the API
    fetch('YOUR_API_URL')
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                displayAlertData(data);
            } else {
                displayNoAlerts();
            }
        })
        .catch(error => console.error('Error fetching data:', error));

    // Function to display alert data
    function displayAlertData(data) {
        var alertDataDiv = document.getElementById('alertData');
        alertDataDiv.innerHTML = '<h2>Alert Reports</h2>';
        
        // Loop through the JSON data and display it
        data.forEach(function (alert) {
            var alertElement = document.createElement('div');
            alertElement.textContent = alert.message;
            alertDataDiv.appendChild(alertElement);
        });
    }

    // Function to display no alerts message and time elapsed
    function displayNoAlerts() {
        var alertDataDiv = document.getElementById('alertData');
        alertDataDiv.innerHTML = '<h2>No Active Alert Reports</h2>';

        var timeElapsedDiv = document.getElementById('timeElapsed');
        var currentTime = new Date();
        var formattedTime = formatTime(currentTime);
        timeElapsedDiv.textContent = `As of ${formattedTime}`;
    }

    // Function to format time as HH:MM:SS - DD/MM/YY
    function formatTime(date) {
        var hours = date.getHours().toString().padStart(2, '0');
        var minutes = date.getMinutes().toString().padStart(2, '0');
        var seconds = date.getSeconds().toString().padStart(2, '0');
        var day = date.getDate().toString().padStart(2, '0');
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var year = date.getFullYear().toString().substr(-2);

        return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
    }

    // Function to update time elapsed every second
    function updateTimeElapsed() {
        var timeElapsedDiv = document.getElementById('timeElapsed');
        var startTime = new Date();

        setInterval(function () {
            var currentTime = new Date();
            var elapsedTime = (currentTime - startTime) / 1000; // in seconds
            var seconds = Math.floor(elapsedTime % 60);
            var minutes = Math.floor(elapsedTime / 60);

            timeElapsedDiv.textContent = `Time Elapsed: ${minutes} mins ${seconds} seconds`;
        }, 1000);
    }

    updateTimeElapsed();
});
