async function testAssignment() {
    const baseUrl = 'http://localhost:3000';

    console.log('Logging in as Test Client...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test_client_assign@example.com',
            password: 'password'
        })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    const cookie = loginRes.headers.get('set-cookie');
    console.log('Login successful. Cookie received.');

    console.log('Creating Issue with no assignee...');
    const createRes = await fetch(`${baseUrl}/api/issues`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({
            title: 'Auto Assignment Verification Issue (Busy Test)',
            description: 'Testing if this gets assigned to Staff Inefficient because Staff Efficient is busy',
            category: 'IT/Technical',
            priority: 'High'
        })
    });

    if (!createRes.ok) {
        console.error('Create issue failed:', await createRes.text());
        return;
    }

    const data = await createRes.json();
    const issue = data.issue;

    console.log('\n--- VERIFICATION RESULT ---');
    if (issue.assignedTo) {
        console.log(`Assigned To Name: ${issue.assignedTo.name}`);
        console.log(`Assigned To Email: ${issue.assignedTo.email}`);

        if (issue.assignedTo.name === 'Staff Inefficient') {
            console.log('SUCCESS (Busy Test): Issue was assigned to the SECOND most efficient staff member because #1 was busy.');
        } else if (issue.assignedTo.name === 'Staff Efficient') {
            console.log('FAILURE (Busy Test): Issue was assigned to Staff Efficient despite being BUSY.');
        } else {
            console.log('Observation: Assigned to ' + issue.assignedTo.name);
        }
    } else {
        console.log('FAILURE: Issue was NOT assigned to anyone.');
    }
}

testAssignment();
