// routes/login.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Received login request:', { email }); // Log the email received from the request
    try {
      const user = await User.findOne({ email });
      console.log('User found in the database:', { user }); // Log the user object retrieved from the database
      if (!user) {
        console.log('User not found'); // Log that user is not found
        res.status(404).send('User not found');
        return;
      }
      if (await bcrypt.compare(password, user.password)) {
        console.log('Password matched'); // Log that password matched
        req.session.user = user;
        res.redirect('/');
      } else {
        console.log('Incorrect password'); // Log that password is incorrect
        res.status(401).send('Incorrect password');
      }
    } catch (err) {
      console.error('Error during login:', err); // Log any errors that occur during login
      res.status(500).send('Server Error');
    }
});
    

module.exports = router;
