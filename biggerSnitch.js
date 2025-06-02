(async () => {
  // Get user info
  const referral = document.referrer;
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  const userAgent = navigator.userAgent;

  // Get public IP and geolocation info
  const response = await fetch('https://ipapi.co/json/');
  const data = await response.json();

  const ipv4 = data.ip;
  const isp = data.org;
  const city = data.city;
  const region = data.region;
  const country = data.country_name;

  // Telegram message via HTTP API
  const message = `
Referral: ${referral}
Screen Size: ${screenSize}
UserAgent: ${userAgent}
IPv4: ${ipv4}
ISP: ${isp}
City: ${city}
Region: ${region}
Country: ${country}
  `;

  await fetch(`https://api.telegram.org/bot5871224544:AAH2CkeLJSsmdmp4MIGIul8welqy6hLFVPU/sendMessage?`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      chat_id: '920222421',
      text: message
    })
  });

  // JSON payload to dev.gbya.co.uk API
  const payload = {
    referral,
    screenSize,
    userAgent,
    ipv4,
    isp,
    city,
    region,
    country
  };

  await fetch('https://dev.gbya.co.uk:1880/api/stats', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });

  // Google Form submission
  const formData = new URLSearchParams();
  formData.append('entry.892498641', referral);
  formData.append('entry.1901027788', screenSize);
  formData.append('entry.969765927', userAgent);
  formData.append('entry.2117199347', ipv4);
  formData.append('entry.549660076', ipv4);
  formData.append('entry.2013092505', isp);
  formData.append('entry.1869650762', city);
  formData.append('entry.1947891450', region);
  formData.append('entry.1898496053', country);

  await fetch('https://docs.google.com/forms/d/e/1FAIpQLSd-aL-UixiIc5yTbh67x9JV77y3kGvQ6SN-nR6WVvR5Sfl0WQ/formResponse', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: formData.toString()
  });

})();
