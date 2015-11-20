/**
 * Module dependencies
 */

var Resource       = require('deployd/lib/resource'),
    util           = require('util'),
    nodemailer     = require('nodemailer'),
    smtp           = require('nodemailer-smtp-transport'),
    htmlToText     = require('nodemailer-html-to-text').htmlToText,
    inlineBase64   = require('nodemailer-plugin-inline-base64');

/**
 * Module setup.
 */

function Email( ) {

  Resource.apply( this, arguments );

  var authParams={
      user: this.config.username || process.env.DPD_EMAIL_USERNAME,
      pass: this.config.password || process.env.DPD_EMAIL_SMTP_PASSWORD
    };


  this.transport = nodemailer.createTransport(smtp({
    host : this.config.host || process.env.DPD_EMAIL_HOST || 'localhost',
    port : parseInt(this.config.port, 10) || process.env.DPD_EMAIL_PORT || 25,
    secure : this.config.ssl,
    //service: 'gmail',
    auth : authParams
  }))

  this.transport.use('compile', htmlToText({}) );

}
util.inherits( Email, Resource );

Email.prototype.clientGeneration = true;

Email.basicDashboard = {
  settings: [
  {
    name        : 'host',
    type        : 'text',
    description : 'Host name of your SMTP provider. Defaults to DPD_EMAIL_HOST env variable or \'localhost\'.'
  }, {
    name        : 'port',
    type        : 'numeric',
    description : 'Port number of your SMTP provider. Defaults to DPD_EMAIL_PORT env variable or 25'
  }, {
    name        : 'ssl',
    type        : 'checkbox',
    description : 'Use SSL.'
  }, {
    name        : 'username',
    type        : 'text',
    description : 'SMTP username. Leave blank to use the DPD_EMAIL_USERNAME env variable'
  }, {
    name        : 'password',
    type        : 'text',
    description : 'SMTP password. Leave this blank to use the DPD_EMAIL_SMTP_PASSWORD environment variable'
  }, {
    name        : 'defaultFromAddress',
    type        : 'text',
    description : 'Optional; if not provided will use the DPD_EMAIL_DEFAULT_FROM env var or you will need to provide a \'from\' address in every request'
  }, {
    name        : 'internalOnly',
    type        : 'checkbox',
    description : 'Only allow internal scripts to send email'
  }, {
    name        : 'productionOnly',
    type        : 'checkbox',
    description : 'If on development mode, print emails to console instead of sending them'
  },{
    name        : 'base64',
    type        : 'checkbox',
    description : 'If using base64 encrypted images, encode them properly'
  }]
};

/**
 * Module methodes
 */

Email.prototype.handle = function ( ctx, next ) {

  if ( ctx.req && ctx.req.method !== 'POST' ) {
    return next();
  }

  if ( !ctx.req.internal && this.config.internalOnly ) {
    return ctx.done({ statusCode: 403, message: 'Forbidden' });
  }

  var options = ctx.body || {};
  options.from = options.from || this.config.defaultFromAddress || process.env.DPD_EMAIL_DEFAULT_FROM;

  var errors = {};
  if ( !options.to ) {
    errors.to = '\'to\' is required';
  }
  if ( !options.from ) {
    errors.from = '\'from\' is required';
  }
  if ( !options.text && !options.html ) {
    errors.text = '\'text\' or \'html\' is required';
  }
  if ( Object.keys(errors).length ) {
    return ctx.done({ statusCode: 400, errors: errors });
  }


  // trim
  options.subject = options.subject ? options.subject.trim() : '';
  options.text = options.text ? options.text.trim() : '';

  var that = this;

  var env = that.options.server.options.env;
  if (that.config.productionOnly && env != 'production') {
    console.log('_______________________________________________');
    console.log('Sent email:');
    console.log('From:    ', options.from);
    console.log('To:      ', options.to);
    if (options.cc) {
      console.log('CC:      ', options.cc);
    }
    if (options.bcc) {
      console.log('BCC:      ', options.bcc);
    }
    console.log('Subject: ', options.subject);
    if (options.text) {
      console.log('Text:');
      console.log( options.text );
    }
    if (options.html) {
      console.log('HTML:');
      console.log( options.html );
    }
    console.log('```````````````````````````````````````````````');
    return ctx.done( null, { message : 'Simulated sending' } );
  }

  if(options.html && that.config.base64){
    that.transport.use('compile', inlineBase64);
  }

  that.transport.sendMail(
    options,
    function( err, response ) {
      if ( err ) {
        return ctx.done( err );
      }
      ctx.done( null, { message : response.message } );
    }
  );
}

/**
 * Module export
 */

module.exports = Email;
