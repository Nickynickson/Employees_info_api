const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const OAuth2Strategy = require('passport-oauth2');
const bcrypt = require('bcrypt');
require('dotenv').config();

const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
const uri = "mongodb+srv://nicholaskwabenaamo:Lowkeymovement02@cluster.8wmqd.mongodb.net/Employees_info_api"
const PORT = process.env.PORT || 5000;

// Middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});
app.use(cors());
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

passport.use(new OAuth2Strategy({
    authorizationURL: 'https://github.com/login/oauth/authorize?client_id=GITHUB_CLIENT_ID',
    tokenURL: 'https://github.com/login/oauth/access_token',
    clientID: 'process.env.GITHUB_CLIENT_ID',
    clientSecret: 'process.env.GITHUB_CLIENT_SECRET',
    callbackURL: 'CALLBACK_URL'
},
function(accessToken, refreshToken, profile, done) {
    // Handle user information and store in database
    return done(null, profile);
}));

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
    return next();
    }
    res.redirect('/login');
}




// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
})
.then(() => {
    console.log('Connected to Employees_info_api database');
})
.catch(err => {
    console.error('Database connection error:', err);
});

// Routes
app.use('/employees', employeeRoutes);
// User Registration
app.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // Save user with hashed password to MongoDB
});

app.get('/protected', isAuthenticated, (req, res) => {
    res.send('This is a protected route.');
});


// Login
app.post('/login', passport.authenticate('oauth2', {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
}));

// Logout
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
