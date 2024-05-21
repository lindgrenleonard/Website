document.getElementById('fetchTime').addEventListener('click', function() {
    fetch('/time')
    .then(response => response.text())
    .then(data => {
        document.getElementById('response').textContent = data;
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('fetchData').addEventListener('click', function() {
    fetch('/data')
    .then(response => response.json())
    .then(data => {
        const display = data.map(user => `ID: ${user.id}, Name: ${user.name}`).join(', ');
        document.getElementById('response').textContent = display;
    })
    .catch(error => console.error('Error:', error));
});
