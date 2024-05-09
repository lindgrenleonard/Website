const https = require('https');

function fetchCurrentTime(callback) {
    const url = 'https://worldtimeapi.org/api/timezone/CET';

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                callback(null, result.datetime);
            } catch (e) {
                callback(e, null);
            }
        });
    }).on('error', (err) => {
        callback(err, null);
    });
}

module.exports = { fetchCurrentTime };
