const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const env = require('./config/environment');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8001;

require('./config/view-helpers')(app);
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');

// use express session for authentication
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportJwt = require('./config/passport-jwt-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');
const MongoStore = require('connect-mongo');
const sassMiddleware = require('node-sass-middleware');
const flash = require('connect-flash');
const customWare = require('./config/middleware');

// setup the chat server with socket io
const chatServer = require("http").Server(app);
const chatSockets = require('./config/chat_sockets').chatSockets(chatServer);
chatServer.listen(5000);
console.log('chat server is listening on port 5000');
const path = require('path');

app.use(cors());

if(env.name == 'development'){
  app.use(
    sassMiddleware({
      //src: path.join(__dirname, env.asset_path, 'scss'),
      //dest: path.join(__dirname, env.asset_path, 'css'),
      src: './public/assets/scss',
      dest: './public/assets/css',
      debug: true,
      outputStyle: 'extended',
      prefix: '/css',
    })
  );  
}

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(express.static('./public/assets'));
// make the upload path
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(logger(env.morgan.mode, env.morgan.options));
app.use(expressLayouts);
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

//set up view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Mongo store is used to store the session cookie in the db
app.use(
  session({
    name: 'codial',
    // To do change secret key on production mode
    secret: env.session_cookie_key,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: MongoStore.create(
      {
        mongoUrl: `mongodb://localhost/${env.db}`,
        autoRemove: 'disabled',
      },
      function (err) {
        console.log(err || 'connect-mongo setup is ok');
      }
    ),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customWare.setFlash);

app.use('/', require('./routes'));

app.listen(port, function (err) {
  if (err) {
    console.log(`Error in running the server : ${err}`);
  }

  console.log(`Server is running on port: ${port}`);
});
