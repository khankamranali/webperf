var flash = require('connect-flash')
  , express = require('express')
  , passport = require('passport')
  , util = require('util')
  , LocalStrategy = require('passport-local').Strategy
  , router = express.Router();

var users = [
    { id: 1, username: 'kamran.khan@hcl.com', password: 'secret', email: 'kamran.khan@hcl.com' },
	{ id: 2, username: 'vjangam@tibco.com', password: 'secret', email: 'vjangam@tibco.com' },
	{ id: 3, username: 'vaibhav.saxena@hcl.com', password: 'secret', email: 'vaibhav.saxena@hcl.com' },
	{ id: 4, username: 'swapnil.gupta@hcl.com', password: 'secret', email: 'swapnil.gupta@hcl.com' },
	{ id: 5, username: 'sagar.tondon@hcl.com', password: 'secret', email: 'sagar.tondon@hcl.com' },
	{ id: 6, username: 'shbhatt@tibco.com', password: 'secret', email: 'shbhatt@tibco.com' },
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.

passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Invalid email or password.' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid email or password.' }); }
        return done(null, user);
      })
    });
  }
));




router.get('/login', function(req, res){
  res.render('login', { user: req.user, message: req.flash('error') });
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.

router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/select-app');
  });


router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;