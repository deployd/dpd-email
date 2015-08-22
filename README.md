# Email Resource

Module for Deployd that allows you to send an email to your users.

This is built on Andris Reinmans [Nodemailer](https://github.com/andris9/Nodemailer) module.

## Installation

`$ npm install --save dpd-email`

See [Installing Modules](http://docs.deployd.com/docs/using-modules/) for details.

## Configuration

Before using the email resource, you must go to its Dashboard page and configure it.

### Required settings:

**host**  
The hostname of your SMTP provider. Leave this blank to use the DPD\_EMAIL\_HOST environment variable.

**port**  
The port number of your SMTP provider. Leave this blank to use the DPD\_EMAIL\_PORT environment variable. Defaults to 25; 587 is also common.

**ssl**  
If checked, use SSL to communicate with your SMTP provider.

**username**  
The SMTP username for your app. Leave this blank to use the DPD\_EMAIL\_USERNAME environment variable.

**password**  
The SMTP password for your app. Leave this blank to use the DPD\_EMAIL\_SMTP\_PASSWORD environment variable.  

### Optional settings:

**defaultFromAddress**  
A "from" email address to provide by default. Leave this blank to use the DPD\_EMAIL\_DEFAULT\_FROM environment variable. If this is not provided, you will need to provide this address in every request.

**internalOnly**  
If checked, only allow internal requests (such as those from events) to send emails. Recommended for security.

**productionOnly**  
If checked, attempting to send an email in the development environment will simply print it to the Deployd console.

## Usage

To send an email, call dpd.email.post(options, callback) (replacing email with your resource name). The options argument is an object:

```
{

	// The email address of the sender. Required if defaultFromAddress is not configured.
	// Can be plain (sender@server.com) or formatted (Sender Name <sender@server.com>)
	from : "",

	// Comma separated list of recipients e-mail addresses that will appear on the To: field
	to : "",

	// Comma separated list of recipients e-mail addresses that will appear on the Cc: field
	cc : "",

	// Comma separated list of recipients e-mail addresses that will appear on the Bcc: field
	bcc : "",

	// The subject of the e-mail.
	subject : "",

	// The plaintext version of the message (can also be generated via templating)
	text : "",

	// The HTML version of the message;
	html : "",
}
```

## Example Usage

```
// On POST /users

dpd.email.post({
  to      : this.email,
  subject : 'MyApp registration',
  text    : [
  	this.username,
  	'',
  	'Thank you for registering for MyApp!'
  ].join('\n')
}, function ( err, results ) {
	// ...
});
```


## Template

This package no longer provides template feature. You can use

 - [https://www.npmjs.org/package/handlebars]
 - [https://www.npmjs.org/package/ejs]
 - [https://www.npmjs.org/package/lotemplate]

for render html or text before calling dpd.email.post()


## Contributors

- [View](https://github.com/deployd/dpd-email/graphs/contributors)
