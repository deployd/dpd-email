/**
* Module dependencies
*/

var Resource       = require('deployd/lib/resource'),
util           = require('util'),
path           = require('path'),
async          = require('async'),
nodemailer     = require('nodemailer'),
templatesDir   = path.join( __dirname, '../..', 'resources', 'email', 'templates' );

var smtp = require('nodemailer-smtp-transport');
var htmlToText = require('nodemailer-html-to-text').htmlToText;

/**
* Module setup.
*/

function Email( ) {

    Resource.apply( this, arguments );

    this.transport = nodemailer.createTransport(smtp({
        host : this.config.host || 'localhost',
        port : parseInt(this.config.port, 10) || 25,
        secure : this.config.ssl,
        //service: 'gmail',
        auth : {
            user: this.config.username,
            pass: this.config.password
        }
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
        description : 'Host name of your SMTP provider. Defaults to \'localhost\'.'
    }, {
        name        : 'port',
        type        : 'numeric',
        description : 'Port number of your SMTP provider. Defaults to 25'
    }, {
        name        : 'ssl',
        type        : 'checkbox',
        description : 'Use SSL.'
    }, {
        name        : 'username',
        type        : 'text',
        description : 'SMTP username'
    }, {
        name        : 'password',
        type        : 'text',
        description : 'SMTP password'
    }, {
        name        : 'defaultFromAddress',
        type        : 'text',
        description : 'Optional; if not provided you will need to provide a \'from\' address in every request'
    }, {
        name        : 'defaultTemplate',
        type        : 'text',
        description : 'Optional; if not provided no default template will be used and the mail is plain txt'
    }, {
        name        : 'internalOnly',
        type        : 'checkbox',
        description : 'Only allow internal scripts to send email'
    }, {
        name        : 'productionOnly',
        type        : 'checkbox',
        description : 'productionOnly'
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
    options.from = options.from || this.config.defaultFromAddress;
    options.template = options.template || this.config.defaultTemplate;

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
        console.log('Subject: ', options.subject);
        console.log('Text:');
        console.log( options.text );
        console.log('HTML:');
        console.log( options.html );
        console.log('```````````````````````````````````````````````');
        return ctx.done( null, { message : 'Simulated sending' } );
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
