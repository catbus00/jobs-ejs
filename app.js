// requirements

const express = require('express');
const app = express();
require('express-async-errors');
require('dotenv').config(); // to load the .env file into the process.env object
const csrf = require('host-csrf');
const cookieParser = require('cookie-parser');

// extra security packages
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

// middleware

app.set('view engine', 'ejs');
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('connect-flash')());
app.use(express.static('public'));

// sessions

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const url = process.env.MONGO_URI;
const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: 'mySessions',
});
store.on('error', function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: 'strict' },
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));

// passport middleware

const passport = require('passport');
const passportInit = require('./passport/passportInit');
passportInit();

app.use(passport.initialize());
app.use(passport.session());

app.use(require('./middleware/storeLocals'));

// csrf middleware

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));
let csrf_development_mode = true;
if (app.get('env') === 'production') {
  csrf_development_mode = false;
  app.set('trust proxy', 1);
}

const csrf_options = {
  development_mode: csrf_development_mode,
  protected_operations: ['POST'],
  protected_content_types: ['application/x-www-form-urlencoded'],
  developer_mode: false,
  header_name: 'csrf-token',
};

app.use(csrf(csrf_options));

// routes

app.get('/', (req, res) => {
  res.render('index');
});
const auth = require('./middleware/auth');
const jobs = require('./routes/jobs');
app.use('/jobs', auth, jobs);
const sessions = require('./routes/sessionRoutes');
app.use('/sessions', csrf(csrf_options), sessions);
const secretWordRouter = require('./routes/secretWord');
app.use('/secretWord', auth, csrf(csrf_options), secretWordRouter);

// error routes

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send(err.message);
});

// extra packages

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Use an external store for consistency across multiple server instances.
  })
);
app.use(helmet());
app.use(xss());

// server initialization

const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await require('./db/connect')(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
