async function testEndpoints() {
  const routes = [
    { url: 'http://localhost:3000/', name: 'Landing Page' },
    { url: 'http://localhost:3000/worker', name: 'Worker App' },
    { url: 'http://localhost:3000/admin', name: 'Admin Dashboard' },
    { url: 'http://localhost:3000/passport/w-ramesh', name: 'Skill Passport Public View' },
  ];

  console.log('Testing FairShift Endpoints:');
  for (const r of routes) {
    try {
      const res = await fetch(r.url);
      console.log(`  ✓ [${res.status}] ${r.name} (${r.url})`);
    } catch (e) {
      console.error(`  ✗ [FAIL] ${r.name}: ${e.message}`);
    }
  }

  // Test Hazard API
  try {
    const apiRes = await fetch('http://localhost:3000/api/classify-hazard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descriptionRaw: 'Deep scaffolding crack with loose iron rods vibrating',
        sector: 'construction',
        language: 'en'
      })
    });
    const data = await apiRes.json();
    console.log(`  ✓ [${apiRes.status}] Hazard Classification API: category="${data.category}", severity="${data.severity}", confidence=${data.confidence}`);
  } catch (e) {
    console.error(`  ✗ [FAIL] Hazard API: ${e.message}`);
  }
}

testEndpoints();
