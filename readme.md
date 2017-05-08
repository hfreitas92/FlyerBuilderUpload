#About 'Flyer Builder'

'Flyer Builder' is an easy way for bands to create a flyer for an event or for a music lover to dream up his or her perfect gig!

Users are able to input information about their band and upcoming event, including basic details like band name, event date etc.. which generates a simple flyer advertising the event.

The project utilizes Javascript like Node.js, Hapi.js & Handlebars.js and a SQLite database.

#How It's Done

A database is created to store the form inputs:

var bandinfo = sequelize.define('bandinfo', { bandName: { type: Sequelize.STRING }, setVenue: { type: Sequelize.STRING }, message: { type: Sequelize.STRING }, rockchoice: { type: Sequelize.STRING }, metalchoice: { type: Sequelize.STRING }, countrychoice: { type: Sequelize.STRING }, popchoice: { type: Sequelize.STRING }, customVenue: { type: Sequelize.STRING }, gigdate: { type: Sequelize.STRING }, });

A 'if block helper' is utilized to display flyer templates, which features different background designs and fonts, based on genre selected by user in form.

For example, for the users that select 'rock' as their genre, code for the rock-themed template is what will be triggered and displayed. An example is shown in the code below:

{{#if formresponse.rockchoice}}

<div id="rockRes">

<p> class="biggertext" {{formresponse.bandName}} </p>

<p>LIVE!</p>

<p> at </p>

<p> class="locationtext" formresponse.setVenue formresponse.customVenue </p>

<p> class="biggertext" formresponse.gigdate </p>

</div>

{{/if}}



#Displaying the Image options

Through the Shutterstock API, users are able to view background image options for their flyer.  Using CSS & HTML the text generated from the flyer form is placed onto the 3 images pulled from the API, which is accessed through JS/Jquery. 

In main.js we are setting up the parameters to fetch our images from the Shutterstock API & display the images.

var API_URL = 'https://api.shutterstock.com/v2/';

// Base 64 encode Client ID and Client Secret for use in the Authorization header

function encodeAuthorization() {
    var clientId = $('input[name=client_id]').val();
    var clientSecret = $('input[name=client_secret]').val();

    if (!clientId || !clientSecret) {
        $('#collapseAuthentication').collapse('show');
        alert('Client id and/or client secret are missing in the API key section, with out these you wont be able to contact the API.');
        return;
    }
    return 'Basic ' + window.btoa(clientId + ':' + clientSecret);
}

// Search media by type

function search(opts, mediaType) {
    var $container = $('#' + mediaType + '-search-results');
    var createComponentFunc = mediaType === 'image' ? renderImageComponent : renderVideoComponent;

    authorization = encodeAuthorization();
    if (!authorization) return;

    var jqxhr = $.ajax({
        url: API_URL + '/' + mediaType + 's/search',
        data: opts,
        headers: {
            Authorization: authorization
        }
    })
        .done(function (data) {
        if (data.total_count === 0) {
            $container.append('<p>No Results</p>');
            return;
        }

        var minHeightCSS = /horizontal/.test(opts) ? 'horizontal-image' : 'vertical-image';
        $.each(data.data, function (i, item) {
            var component = createComponentFunc(item, minHeightCSS);
            $container.append(component);
        });

        // Reduce the options area to show the results
        if (window.innerWidth < 700) $('.collapse.in').collapse();
    })
        .fail(function (xhr, status, err) {
        alert('Failed to retrieve ' + mediaType + ' search results:\n' + JSON.stringify(xhr.responseJSON, null, 2));
    });

    return jqxhr;
}


// Create image wrapper component

function renderImageComponent(image, minHeightCSS) {
    if (!image || !image.assets || !image.assets.preview || !image.assets.preview.url) return;

    var wrapper = $('<div>');
    var thumbWrapper = $('<div>');
    var thumbnail = $('<img>');
    var description = $('<p>');

    $(thumbnail)
        .click(fetchDetails)
        .attr('id', image.id)
        .attr('src', image.assets.preview.url)
        .attr('title', image.description);

    $(thumbWrapper)
        .addClass('thumbnail-crop')
        .css('height', image.assets.preview.height)
        .css('width', "100%")
        .css('opacity',"0.5")
        .css('position', "relative")
        .append(thumbnail);

    $(wrapper)
        .addClass('image-float-wrapper image ' + minHeightCSS)
        .append(thumbWrapper);

    return wrapper;
}


Through a combination of what's left in the main.js file and the dbresponse.html file, we can further sort through options the API provides based on code from a wrapper provided by Shutterstock which has been modified to fit this app's needs.


#NEXT STEPS

Future builds of this app should include functionality that affords the user greater options for customization. One simple example includes allowing for users to select from various fonts or upload images that could be incorporated into the flyer design. These custom images could either be uploaded via personal files or fetched through an API connected to a service like IMGUR.

Another piece of functionality within the form itself is allowing for user to add additional names of other acts if a show has multiple performers.

This will come in future versions.








