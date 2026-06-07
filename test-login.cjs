const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:8082/api/auth/login', {
            email: 'recruiter@enterprise.com',
            password: 'Demo123!'
        });
        console.log("LOGIN RESPONSE:");
        console.log(res.data);
    } catch (e) {
        console.error("ERROR:", e.response ? e.response.data : e.message);
    }
}

test();
