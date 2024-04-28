window.onload = function() {
  getUserIP(getCriminalIPInfo);
};

function getUserIP(callback) {
  const ipifyUrl = 'https://api64.ipify.org?format=json';

  fetch(ipifyUrl)
    .then(response => response.json())
    .then(data => {
      const ipAddress = data.ip;
      callback(ipAddress);
    })
    .catch(error => console.error('Error fetching IP address:', error));
}

function getCriminalIPInfo(ipAddress) {
  const apiKey = 'f7MbyXpR0DB4eZ2OCmsDOkrXcWTgvA8KZN5zs92xeX6gQcSTIZnlTSlh8U7o';
  const criminalIPUrl = `https://api.criminalip.io/v1/asset/ip/report/summary?ip=${ipAddress}`;

  fetch(criminalIPUrl, {
    headers: {
      'x-api-key': apiKey
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log(data); // Example: console.log(data.ipOwner);
      postDataToGoogleForms(data);
    })
    .catch(error => console.error('Error fetching criminal IP info:', error));
}

function postDataToGoogleForms(criminalIPData) {
  const googleFormsUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfxaMcAST4f-9eftb3xtHjDYZVgTqsccfpUb5fdI5ijdR_1cw/formResponse';
  const formData = {
    'entry.75873480': criminalIPData.inboundScore,
    'entry.427917272': criminalIPData.outboundScore,
    'entry.173519531': criminalIPData.country,
    'entry.398453473': criminalIPData.ipOwner,
    'entry.1296757693': criminalIPData.hostname,
    'entry.916279997': criminalIPData.connectedDomains,
    'entry.1941851655': criminalIPData.ipTorCheck,
    'entry.18126576': criminalIPData.isIPVPN,
    'entry.1770720431': criminalIPData.isIPMalicious,
    'entry.394528289': criminalIPData.isIPCDN,
    'entry.552027390': criminalIPData.isIsHosting,
    'entry.1569172627': criminalIPData.isIPMobile,
    'entry.1578207496': criminalIPData.isIPProxy,
    'entry.1287302575': criminalIPData.isIPScanner,
    'entry.1598041706': criminalIPData.specialIssues,
    'entry.708892794': criminalIPData.ipAbuseScore,
    'entry.487096014': criminalIPData.isAdminPage,
    'entry.1337857246': criminalIPData.exploitDBVulnerabilities,
    'entry.696327124': criminalIPData.isInvalidSSL,
    'entry.1994954578': criminalIPData.isNetworkDevice,
    'entry.1201238833': criminalIPData.hasOpenPorts,
    'entry.2073694139': criminalIPData.hasPolicyViolation
  };

  fetch(googleFormsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(formData)
  })
    .then(response => {
      if (response.ok) {
        console.log('Data submitted successfully to Google Forms');
      } else {
        console.error('Failed to submit data to Google Forms');
      }
    })
    .catch(error => console.error('Error posting data to Google Forms:', error));
}
