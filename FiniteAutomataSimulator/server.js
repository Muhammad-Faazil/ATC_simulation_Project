const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for automaton validation (optional extension)
app.post('/api/validate', express.json(), (req, res) => {
    // This could be extended for server-side validation
    res.json({ valid: true });
});

app.listen(port, () => {
    console.log(`Finite Automata Simulator running at http://localhost:${port}`);
    console.log(`Press Ctrl+C to stop the server`);
});