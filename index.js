var Resource = require('deployd/lib/resource')
  , util = require('util')
  , nodemailer = require('nodemailer');

function Email(options) {
  Resource.apply(this, arguments);

  this.transport = nodemailer.createTransport("SMTP", {
      host: this.config.host || 'localhost'
    , port: parseInt(this.config.port, 10) || 25
    , secureConnection: this.config.ssl
    , auth: {
      user: this.config.username,
      pass: this.config.password
    }
  });
}
util.inherits(Email, Resource);
module.exports = Email;

Email.prototype.clientGeneration = true;

Email.basicDashboard = {
  settings: [{
      name: 'host'
    , type: 'text'
    , description: "Host name of your SMTP provider. Defaults to 'localhost'."
  },{
      name: 'port'
    , type: 'numeric'
    , description: "Port number of your SMTP provider. Defaults to 25"
  },{
      name: 'ssl'
    , type: 'checkbox'
    , description: "Use SSL."
  },{
      name: 'username'
    , type: 'text'
    , description: "SMTP username"
  }, {
      name: 'password'
    , type: 'text'
    , description: "SMTP password"
  }, {
      name: 'defaultFromAddress'
    , type: 'text'
    , description: "Optional; if not provided you will need to provide a 'from' address in every request"
  }, {
      name: 'internalOnly'
    , type: 'checkbox'
    , description: "Only allow internal scripts to send email"
  }, {
      name: 'productionOnly'
    , type: 'checkbox'
    , description: "If on development mode, print emails to console instead of sending them"
  }]
};

Email.prototype.handle = function (ctx, next) {
  if(ctx.req && ctx.req.method !== 'POST') return next();

  var options = ctx.body || {};
  options.from = options.from || this.config.defaultFromAddress;

  if (!ctx.req.internal && this.config.internalOnly) {
    return ctx.done({statusCode: 403, message: "Forbidden"});
  }

  var errors = {};
  if (!options.to) errors.to = "'to' is required";
  if (!options.from) errors.to = "'from' is required";

  if (Object.keys(errors).length) {
    return ctx.done({errors: errors, statusCode: 400});
  }

  if (this.config.productionOnly && this.options.server.options.env === 'development') {
    setTimeout(function() {
      console.log();
      console.log("Sent email:");
      console.log("From:    ", options.from);
      console.log("To:      ", options.to);
      console.log("Subject: ", options.subject);
      console.log(options.text || options.html);
      ctx.done(null, {message: "Simulated sending"});
    }, 1);
  } else {
    this.transport.sendMail(options, function(err, response) {
      if (err) return ctx.done(err);
      ctx.done(null, {message: response.message});
    });
  }

};