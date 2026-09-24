const ngrok = require('@ngrok/ngrok');

process.on('uncaughtException', (err) => {
  console.error('[Tunnel UncaughtException]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Tunnel UnhandledRejection]', reason);
});

async function startTunnel() {
  try {
    const listener = await ngrok.forward({
      addr: 5173,
      authtoken: '3IzyavmPdtsOSPQt1vIiljno4nW_5U5TSpK41VZoaoB5Z5PNX',
    });
    console.log(`====================================================`);
    console.log(`🚀 SENADA APPLICATION IS LIVE VIA NGROK!`);
    console.log(`🌐 Public Access URL: ${listener.url()}`);
    console.log(`====================================================`);

    // Keep event loop alive indefinitely
    setInterval(() => {
      // heart-beat
    }, 1000 * 60);
  } catch (err) {
    console.error('Error starting ngrok tunnel:', err);
    setTimeout(startTunnel, 5000);
  }
}

startTunnel();
