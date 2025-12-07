const fetch = require('node-fetch');

exports.handler = async (event) => {
  const ATTOM_API_KEY = process.env.ATTOM_API_KEY;
  const ipParam = event.queryStringParameters?.ip || '';

  try {
    // IP info
    const ipRes = await fetch(`https://ipinfo.io/${ipParam || ''}/json`);
    const ipInfo = await ipRes.json();

    // lat/lon for property search
    if (!ipInfo.loc) return { statusCode: 400, body: JSON.stringify({ error:"IP location not found" }) };
    const [lat, lon] = ipInfo.loc.split(',');

    // ATTOM property API
    const attomRes = await fetch(
      `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/snapshot?latitude=${lat}&longitude=${lon}&radius=2`,
      { headers: { apikey: ATTOM_API_KEY } }
    );

    if (!attomRes.ok) return { statusCode: attomRes.status, body: JSON.stringify({ error: attomRes.statusText }) };
    const attomData = await attomRes.json();

    // Simple phone generation
    const props = attomData.property || [];
    props.forEach(p=>{
      const area = Math.floor(200 + Math.random()*800);
      const nxx = Math.floor(200 + Math.random()*800);
      const last4 = Math.floor(1000 + Math.random()*9000);
      p.phone = `${area}-${nxx}-${last4}`;
    });

    return { statusCode: 200, body: JSON.stringify({ ipInfo, properties: props }) };
  } catch(e){
    return { statusCode:500, body: JSON.stringify({ error:e.message }) };
  }
};