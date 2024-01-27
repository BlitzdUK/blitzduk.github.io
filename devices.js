function logDeviceDetails() {
  const browserName = navigator.appName;
  const browserVersion = navigator.appVersion;
  const userAgent = navigator.userAgent;
  const operatingSystem = navigator.platform;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const isMobile = /Mobi/.test(navigator.userAgent);
  const userLanguage = navigator.language || navigator.userLanguage;

  console.log('Browser Name:', browserName);
  console.log('Browser Version:', browserVersion);
  console.log('User Agent:', userAgent);
  console.log('Operating System:', operatingSystem);
  console.log('Screen Width:', screenWidth);
  console.log('Screen Height:', screenHeight);
  console.log('Is Mobile Device:', isMobile);
  console.log('User Language:', userLanguage);

  const postData = {
    browserName,
    browserVersion,
    userAgent,
    operatingSystem,
    screenWidth,
    screenHeight,
    isMobile,
    userLanguage
  };

  fetch('https://blitzd.gotdns.ch:1880/js/devices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  })
  .then(response => response.json())
  .then(data => console.log('POST request successful:', data))
  .catch(error => console.error('Error during POST request:', error));
}

logDeviceDetails();