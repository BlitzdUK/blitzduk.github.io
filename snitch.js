async function performIPLookup(ip) {
  const apiKey = 'dc636aa2bdb6431961ac16273ebaf3d1';
  const url = `https://api.ipstack.com/${ip}?access_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('IP Lookup failed:', error);
    return null;
  }
}
async function submitToGoogleForms(formData) {
  const formUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSckfmfyrG2fSGE97iaAx9CW9pUdoST-tDaWEnDQL1xUG43HBQ/formResponse';

  try {
    const response = await fetch(formUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(formData),
    });

    console.log('Form submission response:', response);
  } catch (error) {
    console.error('Form submission failed:', error);
  }
}

async function main() {
  const userAgent = navigator.userAgent;
  const ipResponse = await fetch('https://api.ipify.org?format=json');
  const ipData = await ipResponse.json();
  const ipAddress = ipData.ip;
  const pageURL = window.location.href;

  const ipLookupResult = await performIPLookup(ipAddress);

  const formData = {
    'entry.1064469062': ipLookupResult.region_name,
    'entry.1284802502': ipLookupResult.connection.isp,
    'entry.1793238467': ipLookupResult.city,
    'entry.1412711051': ipLookupResult.country_name,
    'entry.2103806015': ipAddress,
    'entry.1381334581': userAgent,
    'entry.2095676594': pageURL,
  };
  await submitToGoogleForms(formData);
}

main();