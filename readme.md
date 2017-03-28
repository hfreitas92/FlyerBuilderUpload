#About 'Band Booker'

'Band Booker' is an easy way for bands to create a flyer for an event or for a music lover to dream up his or her perfect gig!

Users are able to input information about their band and upcoming event, including basic details like band name, event date etc.. which generates a simple flyer advertising the event. 

The project utilizes Javascript like Node.js, Hapi.js & Handlebars.js and a SQLite database.

#How It's Done 

A database is created to store the form inputs:


var bandinfo = sequelize.define('bandinfo', {
    bandName: {
        type: Sequelize.STRING
    },
    setVenue: {
        type: Sequelize.STRING
    },
    message: {
        type: Sequelize.STRING
    },
    rockchoice: {
        type: Sequelize.STRING
    },
     metalchoice: {
        type: Sequelize.STRING
    },
     countrychoice: {
        type: Sequelize.STRING
    },
     popchoice: {
        type: Sequelize.STRING
    },
    customVenue: {
        type: Sequelize.STRING
    },
    gigdate: {
        type: Sequelize.STRING
    },
});


A 'if block helper' is utilized to display flyer templates, which features different background designs and fonts, based on genre selected by user in form.

For example, for the users that select 'rock' as their genre, code for the rock-themed template is what will be triggered and displayed.  An example is shown in the code below:


#if formresponse.rockchoice


div id="rockRes"

p class="biggertext"
{{formresponse.bandName}}
/p

pLIVE!/p


p at /p

p class="locationtext"
formresponse.setVenue
formresponse.customVenue 
/p

p class="biggertext"
formresponse.gigdate
/p

div

/if


#NEXT STEPS

Future builds of this app should include functionality that affords the user greater options for customization.  One simple example includes allowing for users to upload images that could be incorporated into the flyer design. These custom images could either be uploaded via personal files or fetched through an API connected to a service like IMGUR.

The app should also explore functionality that allows for users to select from a diverse set of flyers that are generated.  These options can mean that users can see flyers of varying size and styles and that the user can select whichever is a better fit.

Another piece of functionality within the form itself is allowing for user to add additional names of other acts if a show has multiple performers.









