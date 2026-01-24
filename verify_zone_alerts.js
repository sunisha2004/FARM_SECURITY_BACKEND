
// Configuration
const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'farmer@test.com'; 
const PASSWORD = 'password123';

const verifyZoneAlerts = async () => {
    try {
        console.log("1. Authenticating...");
        
        let token;
        
        // Try Register first
        try {
            await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'TestFarmer', email: EMAIL, password: PASSWORD })
            });
            console.log("   Registration attempt made.");
        } catch(e) { /* ignore if exists */ }

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
            console.error("   Login failed.", e.message);
            return;
        }

        // 2. We need a Zone ID first. Fetch zones.
        console.log("\n2. Fetching Zones...");
        let zoneId;
        let zoneName;
        try {
            const zonesRes = await fetch(`${BASE_URL}/farmer/zones`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const zones = await zonesRes.json();
            if(zones.length > 0) {
                zoneId = zones[0]._id;
                zoneName = zones[0].zoneName;
                console.log(`   Using Zone: ${zoneName} (${zoneId})`);
            } else {
                console.log("   No zones found. Creating properties...");
                
                // 2a. Create Farm if needed
                try {
                    // Try to fetch farm first? Or just create (assuming 1 farm per user logic usually implies creating one if not exists)
                    // Let's try to create one. If it says "already exists", we ignore.
                   const farmRes = await fetch(`${BASE_URL}/farmer/farm`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ farmName: 'Verification Farm', location: 'Test Location', size: 100 })
                   });
                   // If 400 (already exists) or 201 (created), we proceed. 
                   if(farmRes.ok || farmRes.status === 400) {
                       console.log("   Farm ensured.");
                   } else {
                       throw new Error(`Farm creation failed: ${farmRes.status}`);
                   }
                } catch(e) { console.log("   Farm check/create note:", e.message); }

                // 2b. Create Zone
                console.log("   Creating a test zone...");
                const createZoneRes = await fetch(`${BASE_URL}/farmer/zones`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ zoneName: 'Auto Verification Zone', riskLevel: 'low' })
                });
                if(!createZoneRes.ok) throw new Error(`Failed to create zone: ${createZoneRes.status}`);
                const newZone = await createZoneRes.json();
                zoneId = newZone._id;
                zoneName = newZone.zoneName;
                console.log(`   Created Zone: ${zoneName} (${zoneId})`);
            }
        } catch(e) { console.error("   Fetch zones failed", e.message); return; }

        // 3. Upload a mock video with this zone
        // Since uploading is multipart/form-data and tricky with fetch in simple script without Blob/File, 
        // we might skip actual file upload if we can mock the video entry creation or just reuse an existing ID if we knew it.
        // OR we just test the Alert endpoint capability to look up ANY video.
        
        // Let's assume we can rely on `processDetection`'s logic: 
        // "If videoId provided, fetch video". 
        // Unfortuantely we need a valid videoId in DB that HAS a zoneId.
        // So we really should try to upload or update a video.
        
        // Let's list videos first.
        console.log("\n3. Listing Videos to pick one...");
        let videoId;
        try {
             const vidRes = await fetch(`${BASE_URL}/videos`, {
                 headers: { 'Authorization': `Bearer ${token}` }
             });
             const videos = await vidRes.json();
             if(videos.length > 0) {
                 videoId = videos[0]._id;
                 console.log(`   Using existing Video: ${videos[0].title} (${videoId})`);
                 
                 // Ideally we update this video to have our zoneId, because we don't know if it has one.
                 // Video update endpoint might not support updating zoneId based on current controller code?
                 // Checking controller... updateVideo does NOT seem to look for zoneId in req.body.
                 // So we might technically be unable to verify the "lookup" part without a fresh upload or direct DB hack.
                 
                 // Attempting upload with text only? Backend checks req.file. 
                 // We can try to use a dummy file. 
                 console.log("   Skipping upload test as it requires multipart. Testing Alert Logic directly with provided zoneId first.");
                 
             } else {
                 console.log("   No videos found.");
             }
        } catch(e) { console.error("   Fetch videos failed", e.message); }

        // 4. Test Alert Logic: Explicit Zone Name (Should succeed)
        console.log("\n4. Testing Alert with Explicit Zone Name...");
        let alertIdToDelete; 

        try {
            const res = await fetch(`${BASE_URL}/alerts/detect`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    animalType: 'tiger',
                    zoneName: 'EXPLICIT ZONE',
                    videoId: 'dummy' 
                })
            });
            const data = await res.json();
            if(data.zoneName === 'EXPLICIT ZONE') {
                console.log("   ✅ Verified: Used explicit zone name.");
                alertIdToDelete = data._id;
            } else {
                console.error("   ❌ Failed explicit zone check.");
            }
        } catch(e) {}

        // Test Deletion of the alert we just created
        if(alertIdToDelete) {
             console.log("\n5. Deleting Alert...");
             const delRes = await fetch(`${BASE_URL}/alerts/${alertIdToDelete}`, {
                 method: 'DELETE',
                 headers: { 'Authorization': `Bearer ${token}` }
             });
             if(delRes.ok) {
                 console.log("   ✅ Alert deleted successfully.");
             } else {
                 console.error("   ❌ Failed to delete alert.");
             }
        }

        // 5. Test Alert Logic: Zone ID Lookup (Should succeed)
        console.log("\n5. Testing Alert with Zone ID Lookup...");
        try {
            const res = await fetch(`${BASE_URL}/alerts/detect`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    animalType: 'tiger',
                    zoneId: zoneId // From step 2
                })
            });
            const data = await res.json();
            if(data.zoneName === zoneName) {
                console.log(`   ✅ Verified: Looked up zone name '${data.zoneName}' from ID.`);
            } else {
                console.error(`   ❌ Failed lookup. Got '${data.zoneName}', expected '${zoneName}'`);
            }
        } catch(e) {}

    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
};

verifyZoneAlerts();
