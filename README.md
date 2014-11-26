# Email Resource

This custom resource type allows you to send an email to your users.

The email resource is built on Andris Reinmans [Nodemailer](https://github.com/andris9/Nodemailer) module.

## Installation

`$ npm install dpd-email`

See [Installing Modules](http://docs.deployd.com/docs/using-modules/installing-modules.md) for details.

## Configuration

Before using the email resource, you must go to its Dashboard page and configure it.

### Required settings:

**host**  
The hostname of your SMTP provider.

**port**  
The port number of your SMTP provider. Defaults to 25; 587 is also common.

**ssl**  
If checked, use SSL to communicate with your SMTP provider.

**username**  
The SMTP username for your app.

**password**  
The SMTP username for your app.  

### Optional settings:

**defaultFromAddress**  
A "from" email address to provide by default. If this is not provided, you will need to provide this address in every request.

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
