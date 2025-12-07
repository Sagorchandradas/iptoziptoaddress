const lookupBtn = document.getElementById('lookupBtn');
const ipInput = document.getElementById('ipInput');
const loader = document.getElementById('loader');
const result = document.getElementById('result');
const errorBox = document.getElementById('error');
const copyBtn = document.getElementById('copyBtn');
const toast = document.getElementById('toast');

lookupBtn.addEventListener('click', doLookup);
copyBtn.addEventListener('click', () => {
  const txt = document.getElementById('r_phone').textContent;
  navigator.clipboard.writeText(txt);
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'),1200);
});

async function doLookup(){
  errorBox.classList.add('hidden');
  result.classList.add('hidden');
  loader.classList.remove('hidden');

  let ip = ipInput.value.trim();
  const q = ip ? `?ip=${encodeURIComponent(ip)}` : '';

  try{
    const res = await fetch(`/.netlify/functions/lookup${q}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Lookup failed');

    document.getElementById('r_ip').textContent = data.ipInfo.ip || '—';
    document.getElementById('r_zip').textContent = data.properties[0]?.zip || '—';
    document.getElementById('r_city').textContent = data.properties[0]?.city || '—';
    document.getElementById('r_state').textContent = data.properties[0]?.state || '—';
    document.getElementById('r_country').textContent = data.ipInfo.country || '—';
    document.getElementById('r_phone').textContent = data.properties[0]?.phone || '—';

    loader.classList.add('hidden');
    result.classList.remove('hidden');
  }catch(err){
    loader.classList.add('hidden');
    errorBox.textContent = err.message || 'Unknown error';
    errorBox.classList.remove('hidden');
  }
}