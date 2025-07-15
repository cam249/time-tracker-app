const express = require('express');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { v4: uuidv4 } = require('uuid'); // Import UUID for unique timer IDs

// --- Setup ---
const adapter = new FileSync('db.json');
const db = low(adapter);
const app = express();

// Set default database structure if it doesn't exist
db.defaults({ 
    entries: [], 
    properties: [], 
    employees: [],
    activeTimers: [] // Add activeTimers to the database
}).write();

app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies

// --- API Endpoints ---

// -- GET all data --
app.get('/api/data', (req, res) => {
    const data = {
        entries: db.get('entries').value(),
        properties: db.get('properties').value(),
        employees: db.get('employees').value(),
        activeTimers: db.get('activeTimers').value()
    };
    res.json(data);
});

// -- ENTRIES --
app.post('/api/entries', (req, res) => {
    const newEntry = req.body;
    const lastEntry = db.get('entries').orderBy('id', 'desc').first().value();
    newEntry.id = (lastEntry ? lastEntry.id : 0) + 1;
    db.get('entries').push(newEntry).write();
    res.status(201).json(newEntry);
});

app.put('/api/entries/:id', (req, res) => {
    const entryId = parseInt(req.params.id);
    const updatedEntry = req.body;
    db.get('entries').find({ id: entryId }).assign(updatedEntry).write();
    res.json(updatedEntry);
});

app.delete('/api/entries/:id', (req, res) => {
    const entryId = parseInt(req.params.id);
    db.get('entries').remove({ id: entryId }).write();
    res.status(204).send();
});

// -- PROPERTIES --
app.post('/api/properties', (req, res) => {
    const newProperty = req.body;
    const lastProp = db.get('properties').orderBy('id', 'desc').first().value();
    newProperty.id = (lastProp ? lastProp.id : 0) + 1;
    db.get('properties').push(newProperty).write();
    res.status(201).json(newProperty);
});

app.put('/api/properties/:id', (req, res) => {
    const propId = parseInt(req.params.id);
    const updatedProp = req.body;
    db.get('properties').find({ id: propId }).assign(updatedProp).write();
    res.json(updatedProp);
});

app.delete('/api/properties/:address', (req, res) => {
    const propAddress = req.params.address;
    db.get('properties').remove({ address: propAddress }).write();
    db.get('entries').remove({ propertyAddress: propAddress }).write();
    res.status(204).send();
});

// -- EMPLOYEES --
app.post('/api/employees', (req, res) => {
    const { name } = req.body;
    // FIX: Correctly check if employee already exists before adding
    const existing = db.get('employees').find(employee => employee === name).value();
    if (!existing) {
        db.get('employees').push(name).write();
    }
    res.status(201).json({ name });
});

app.delete('/api/employees/:name', (req, res) => {
    const employeeName = req.params.name;
    db.get('employees').pull(employeeName).write();
    res.status(204).send();
});

// --- ACTIVE TIMERS ENDPOINTS ---
app.get('/api/timers', (req, res) => {
    const timers = db.get('activeTimers').value();
    res.json(timers);
});

app.post('/api/timers', (req, res) => {
    const newTimerData = req.body;
    const newTimer = { ...newTimerData, id: uuidv4() }; 
    db.get('activeTimers').push(newTimer).write();
    res.status(201).json(newTimer);
});

app.delete('/api/timers/:id', (req, res) => {
    const timerId = req.params.id;
    db.get('activeTimers').remove({ id: timerId }).write();
    res.status(204).send();
});


// --- Start Server ---
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Backend server is running at http://localhost:${PORT}`);
    console.log('Make sure to install dependencies: npm install express cors lowdb uuid');
});
