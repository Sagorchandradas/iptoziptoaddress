// netlify/functions/lookup.js
const fetch = require("node-fetch"); // node-fetch import
require("dotenv").config();

const ATTOM_API_KEY = process.env.ATTOM_API_KEY;

exports.handler = async (event) => {
  const ip = event.queryStringParameters?.ip || "";

  if (!ip) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "IP is required" }),
    };
  }

  try {
    // 1️⃣ Geo lookup via ip-api.com
    const geoRes = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,zip,query`
    );
    const geo = await geoRes.json();

    if (geo.status !== "success") {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: geo.message || "API failed", ip }),
      };
    }

    const city = geo.city || "Unknown";
    const zip = geo.zip || "00000";
    const state = geo.regionName || "Unknown";
    const country = geo.country || "Unknown";
    const countryCode = geo.countryCode || "--";

    // 2️⃣ Random NANP-valid phone number generator
    // ZIP → areaCode mapping (example)
    const areaCodes = {
      "90": 650, // California
      "10": 212, // New York
      "60": 602, // Arizona
      "70": 704, // North Carolina
      "75": 713, // Texas
      "33": 305, // Florida
      "55": 414, // Wisconsin
      "80": 303, // Colorado
    };
    const zipPrefix = zip.substring(0, 2);
    const area = areaCodes[zipPrefix] || 202; // fallback DC

    function randomNXX() {
      while (true) {
        const n = Math.floor(200 + Math.random() * 800); // 200–999
        const str = String(n);
        if (/^[2-9][0-9]{2}$/.test(str) && !/[0-9]11$/.test(str)) return n;
      }
    }

    const nxx = randomNXX();
    const last4 = Math.floor(1000 + Math.random() * 9000);

    const phone = `${area}-${nxx}-${last4}`;

    // 3️⃣ Optional: ATTOM API property data (commented if not needed)
    // const attomRes = await fetch(
    //   `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/snapshot?latitude=${lat}&longitude=${lon}&radius=2`,
    //   { headers: { apikey: ATTOM_API_KEY } }
    // );
    // const attomData = await attomRes.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ip,
        zip,
        city,
        state,
        country,
        countryCode,
        phone,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
