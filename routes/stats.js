const express = require("express");
const router = express.Router();

const math = require("mathjs");
const si = require("systeminformation");

// * Fetch informations
let cpuTemp, cpuLoad, ramUsage, latency;
let success = true;
try {
  si.cpuTemperature().then((data) => {
    return (cpuTemp = math.round(data.main));
  });
  si.currentLoad().then((data) => {
    return (cpuLoad = math.round(data.currentload));
  });
  si.mem().then((data) => {
    return (ramUsage = math.round((data.used * 100) / data.total));
  });
  si.inetLatency().then((data) => {
    return (latency = math.round(data));
  });
} catch {
  success = false;
}

router.get("/breadberry", (req, res) => {
  res.json({
    success: success,
    informations: {
      cpuLoad: cpuLoad,
      cpuTemp: cpuTemp,
      ramUsage: ramUsage,
      latency: latency,
    },
  });
});

module.exports = router;
