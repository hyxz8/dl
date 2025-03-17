const express = require('express');
const axios = require('axios');
const app = express();

const PORT = 3000;
const TARGET_URL = 'https://generativelanguage.googleapis.com';
const ALLOWED_HEADERS = ['authorization', 'content-type'];

app.use(express.json());  

app.use('*', async (req, res) => {
    try {
        const config = {
            method: req.method,
            url: `${TARGET_URL}${req.url}`,
            headers: {},
            data: req.method === 'POST' ? req.body : null,
            params: req.method === 'GET' ? req.query : null
        };

        for (const header in req.headers) {
            if (ALLOWED_HEADERS.includes(header.toLowerCase())) {
                config.headers[header] = req.headers[header];
            }
        }

        const response = await axios(config);

        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy request failed', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Reverse proxy server running on port ${PORT}`);
});
