function logEvent(event, data) {
  console.log(`[${new Date().toISOString()}] ${event}`, data);
}

module.exports = { logEvent };