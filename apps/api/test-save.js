// Use built-in fetch (Node 18+)
const myFetch = global.fetch;

async function test() {
    console.log('--- Testing POST /properties ---');
    const postPayload = {
        generalInfo: {
            name: "Test Draft " + Date.now(),
            managementType: "WEG",
            status: "DRAFT"
        },
        buildings: [],
        units: []
    };

    let createdId;

    try {
        const res = await myFetch('http://localhost:3333/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postPayload)
        });

        if (!res.ok) {
            console.error('POST status:', res.status);
            console.error('POST text:', await res.text());
        } else {
            const data = await res.json();
            console.log('POST Success:', data.id);
            createdId = data.id;
        }
    } catch (e) {
        console.error('POST Error:', e);
    }

    if (!createdId) return;

    console.log('\n--- Testing PATCH /properties/' + createdId + ' ---');
    const patchPayload = {
        generalInfo: {
            name: "Test Draft UPDATED",
            managementType: "WEG",
            status: "DRAFT"
        },
        buildings: [],
        units: []
    };

    try {
        const res = await myFetch(`http://localhost:3333/properties/${createdId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchPayload)
        });

        if (!res.ok) {
            console.error('PATCH status:', res.status);
            console.error('PATCH text:', await res.text());
        } else {
            const data = await res.json();
            console.log('PATCH Success:', data.name);
        }
    } catch (e) {
        console.error('PATCH Error:', e);
    }
}

test();
