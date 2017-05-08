/* Fetch functions */

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

// Fetch media details
function fetchDetails(event) {
    event.preventDefault();

    var id = event.target.id;
    var mediaType = event.target.tagName === 'IMG' ? 'image' : 'video';
    var authorization = encodeAuthorization();

    if (!id || !authorization) return;

    renderLoadingDetails(id);

    var jqxhr = $.ajax({
        url: API_URL + '/' + mediaType + 's/' + id,
        headers: {
            Authorization: authorization
        }
    })
        .done(function (data) {
        console.log('JSON response', data);

        if (!data || !data.assets || !data.assets) return;

        renderDetails(data);
    })
        .fail(function (xhr, status, err) {
        alert('Failed to retrieve ' + mediaType + ' details:\n' + JSON.stringify(xhr.responseJSON, null, 2));
    });

    return jqxhr;
}

/* Render functions */

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

// Create video wrapper component
function renderVideoComponent(video) {
    if (!video || !video.assets || !video.assets.thumb_mp4 || !video.assets.thumb_mp4.url) return;

    var wrapper = $('<div class="col-xs-12 col-sm-12 col-md-6 col-lg-4">');
    var preview = $('<video width="100%">');
    var description = $('<p>');

    $(preview)
        .click(fetchDetails)
        .attr('id', video.id)
        .attr('src', video.assets.thumb_mp4.url)
        .attr('controls', true)
        .attr('autoplay', true)
        .attr('title', video.description);

    $(wrapper)
        .addClass('video-wrapper video')
        .append(preview)

    return wrapper;
}

// Display media details in a modal
function renderDetails(data) {
    var detailTemplate = $('.detail-template');
    detailTemplate.find('.modal-body').html('<div></div><p><strong>Keywords: </strong><small></small></p>')

    if (data.media_type === 'image') {
        var thumbWrapper = $('<div>');
        var thumbnail = $('<img>');

        $(thumbnail)
            .click(fetchDetails)
            .attr('id', data.id)
            .attr('src', data.assets.preview.url)
            .attr('title', data.description);

        $(thumbWrapper)
            .addClass('thumbnail-crop')
            .css('height', data.assets.preview.height)
            .css('width', data.assets.preview.width)
            .append(thumbnail);

        detailTemplate.find('.modal-body').find('div')
            .append(thumbWrapper)
    } else if (data.media_type === 'video') {
        detailTemplate.find('.modal-body').find('div')
            .append('<video></video>');

        detailTemplate.find('video')
            .attr('src', data.assets.preview_mp4.url)
            .attr('controls', true);
    }

    detailTemplate.find('h3').html(data.description);
    detailTemplate.find('small').html(data.keywords.join(', '));
}

// Render a loading spinner while we wait for image/video details
function renderLoadingDetails(id) {
    var detailTemplate = $('.detail-template');

    detailTemplate.find('.modal-body').html('<i class="fa fa-5x fa-spinner fa-spin"></i>')
    detailTemplate.find('h3').html('Loading ' + id + '...');
    detailTemplate.modal('show');
}

// Simulate user chooses an image/video
function renderServerSideInstructions() {
    alert('Here you will need server-side code to purchase and download the un-watermarked image. See the documentation at https://developers.shutterstock.com/guides/licensing');
}

// Add categories to the category <select>
function renderCategories() {
    var categorySelect = $('[name="category"]')[0];
    ['Abstract', 'Animals/Wildlife', 'Backgrounds/Textures', 'Beauty/Fashion', 'Buildings/Landmarks', 'Business/Finance', 'Celebrities', 'Editorial', 'Education', 'Food and Drink', 'Healthcare/Medical', 'Holidays', 'Illustrations/Clip-Art', 'Industrial', 'Interiors', 'Miscellaneous', 'Model Released Only', 'Nature', 'Objects', 'Parks/Outdoor', 'People', 'Religion', 'Science', 'Signs/Symbols', 'Sports/Recreation', 'Technology', 'The Arts', 'Transportation', 'Vectors', 'Vintage'].map(function (category) {
        categorySelect.add(new Option(category, category));
    });
}

function setDefaultPerPage() {
    var imagesWhichFitOnThePage = (window.innerWidth * window.innerHeight) / (300 * 300);
    var bestPerPage;

    $('select[name=per_page]')
        .find('option')
        .each(function () {
        if (this.value < imagesWhichFitOnThePage) {
            bestPerPage = this.value;
        }
    });

    if (bestPerPage) {
        $('select[name=per_page]').val(bestPerPage);
    }
}

function setColor(target) {
    $("input[name=color]").val(target.value);
}

function useColorsInNatureIfSearchingOnlyByColor(opts) {
    if (/color/.test(opts) & !/category/.test(opts) && !/query/.test(opts)) {
        opts += '&category=Nature';
    }
    return opts;
}

// On Page Load
$(function () {
    renderCategories();
    setDefaultPerPage();

    $('#search-form').submit(function (e) {
        e.preventDefault();

        // Clear current media results
        $('#image-search-results, #video-search-results').empty();
        
        
        // Serialize form options
        var opts = $('input').filter(function () {
            if (this.value === '#999999') return;
            if (this.name === 'client_id') return;
            if (this.name === 'client_secret') return;
            return !!this.value;
        }).serialize();

        opts += '&' + $('select').filter(function () {
            return !!this.value;
        }).serialize();
        opts = useColorsInNatureIfSearchingOnlyByColor(opts);
        console.log('Requesting: ' + opts)

        // Search and display images
        search(opts, 'image');

        // Reduce # videos to better fit on the page
        var perPage = $('select[name=per_page]').val();
        if (perPage > 24) {
            opts = opts.replace('per_page=' + perPage, 'per_page=' + perPage / 2);
        }

        // Search and display videos
        search(opts, 'video');

        return false;
    });
    $('#search-form').submit();
});