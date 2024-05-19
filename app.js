const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Importing models and routes
require('./modals/modal');
require('./modals/post');
app.use(require('./routes/auth'));
app.use(require('./routes/createPost'));
app.use(require('./routes/user'));

// MongoDB connection
const { mongoURL } = require('./keys');
mongoose.connect(mongoURL)
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });

// Serving the frontend
const frontendBuildPath = path.join(__dirname, 'frontend', 'build');
console.log('Frontend build path:', frontendBuildPath);

// Log the contents of the frontend build directory
fs.readdir(frontendBuildPath, (err, files) => {
  if (err) {
    console.error('Error in reading directory:', err);
  } else {
    console.log('Files in frontend build directory:', files);
  }
});

// Serve static files from the frontend build directory
app.use(express.static(frontendBuildPath));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, `index.html`), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(err.status || 500).send('Error: Unable to serve index.html');
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
