function checkServerConnection() {
    var xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Connection successful
                console.log("Server is reachable.");
            } else {
                // Connection failed or server error
                console.log("Server connection failed. Status: " + xhr.status);
                alert("Oh no! Those pesky gremlins are at it again, causing chaos with our servers like an unmediated ADHD kid with a bad cocaine habit! This time they've choosen to target our database with their pranks. But fear not, our crack team of geeks with weapons grade autism are on the case. Sorry for the inconvenience, we’ll sort this out ASAP!");
            }
        }
    };
    
    xhr.open("GET", "https://blitzd.gotdns.ch:1880/data/telematics", true);
    xhr.timeout = 5000;
    xhr.send();
}

window.onload = function() {
    // Check server connection initially
    checkServerConnection();

    // Repeat the check every 10 seconds (10000 milliseconds)
    setInterval(checkServerConnection, 10000);
};
