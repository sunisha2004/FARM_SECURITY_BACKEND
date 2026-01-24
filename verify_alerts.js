
// Configuration
const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'farmer@test.com'; // Adjust to a valid farmer email if known, or register one
const PASSWORD = 'password123';

const verifyalerts = async () => {
    try {
        console.log("1. Authenticating...");
        
        let token;
        try {
            const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: EMAIL, password: PASSWORD })
            });
            
            if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
            
            const loginData = await loginRes.json();
            token = loginData.token;
            console.log("   Success! Token received.");
        } catch (e) {
            console.error("   Login failed. Please ensure the user exists.", e.message);
            return;
        }

        console.log("\n2. Sending Dangerous Animal Detection (Tiger)...");
        try {
            const detectRes = await fetch(`${BASE_URL}/alerts/detect`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    animalType: 'tiger',
                    videoId: 'test-script-id',
                    zoneName: 'Test Zone'
                })
            });

            if (!detectRes.ok) throw new Error(`Detection failed: ${detectRes.status}`);
            
            const detectData = await detectRes.json();
            console.log("   Response:", detectData.message);
            
            if (detectData.severity === 'HIGH') {
                console.log("   ✅ Verified: HIGH severity for Tiger.");
            } else {
                console.error("   ❌ Failed: Expected HIGH severity. Got:", detectData.severity);
            }
        } catch (e) {
            console.error("   Detection request failed:", e.message);
        }

        console.log("\n3. Sending Safe Animal Detection (Cow)...");
        try {
            const detectRes2 = await fetch(`${BASE_URL}/alerts/detect`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    animalType: 'cow',
                    videoId: 'test-script-id',
                    zoneName: 'Test Zone'
                })
            });

            if (!detectRes2.ok) throw new Error(`Detection failed: ${detectRes2.status}`);

            const detectData2 = await detectRes2.json();
            console.log("   Response:", detectData2.message);
            
            if (detectData2.severity === 'LOW') {
                console.log("   ✅ Verified: LOW severity for Cow.");
            } else {
                console.error("   ❌ Failed: Expected LOW severity. Got:", detectData2.severity);
            }
        } catch (e) {
            console.error("   Detection request failed:", e.message);
        }

        console.log("\n4. Fetching Alerts...");
        try {
            const alertsRes = await fetch(`${BASE_URL}/alerts`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!alertsRes.ok) throw new Error(`Fetch failed: ${alertsRes.status}`);
            
            const alertsData = await alertsRes.json();
            console.log(`   Fetched ${alertsData.length} alerts.`);
            const latest = alertsData[0];
            if (latest) {
                console.log("   Latest Alert:", latest.message);
            }
        } catch (e) {
            console.error("   Fetch alerts failed:", e.message);
        }

    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
};

verifyalerts();
