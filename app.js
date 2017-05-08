'use strict';

const Hapi = require('hapi');
const Blipp = require('blipp');
const Vision = require('vision');
const Inert = require('inert');
const Path = require('path');
const Handlebars = require('handlebars');
const Express = require('express');

const fs = require("fs");

const Sequelize = require('sequelize');



const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});

server.connection({
    port: 3000
});


var sequelize = new Sequelize('db', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },

    // SQLite only
    storage: 'db.sqlite'
});


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


server.register([Blipp, Inert, Vision], () => {});

server.views({
    engines: {
        html: Handlebars
    },
    path: 'views',
    layoutPath: 'views/layout',
    layout: 'layout',
    helpersPath: 'views/helpers',
    //partialsPath: 'views/partials'
});


server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: {
            template: 'index'
        }
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './',
            listing: false,
            index: false
        }
    }
});


server.route({
    method: 'GET',
    path: '/createDB',
    handler: function (request, reply) {
        // force: true will drop the table if it already exists
        bandinfo.sync({
            force: true
        })
        reply("Database Created")
    }
});


server.route({
    method: 'GET',
    path: '/flyerbuilder',
    handler: {
        view: {
            template: 'flyerbuilder'
        }
    }
});

server.route({

    method: 'POST',
    path: '/formBand',
    handler: function (request, reply) {
        var formresponse = JSON.stringify(request.payload);
        var parsing = JSON.parse(formresponse);
        //console.log(parsing);

        bandinfo.create(parsing).then(function (currentBand) {
            bandinfo.sync();
            console.log("...syncing");
            console.log(currentBand);
            return (currentBand);
        }).then(function (currentBand) {

            reply.view('formresponse', {
                formresponse: currentBand
            });
        });
    }
});

server.route({
    method: 'GET',
    path: '/displayAll',
    handler: function (request, reply) {
        bandinfo.findAll().then(function (users) {
            // projects will be an array of all User instances
            //console.log(users[0].bandName);
            var allUsers = JSON.stringify(users);
            reply.view('dbresponse', {
                dbresponse: allUsers
            });
        });
    }
});

server.route({
    method: 'GET',
    path: '/destroyAll',
    handler: function (request, reply) {

        bandinfo.drop();

        reply("destroy all");
    }
});

server.route({
    method: 'GET',
    path: '/delete/{id}',
    handler: function (request, reply) {


        bandinfo.destroy({
            where: {
                id: encodeURIComponent(request.params.id)
            }
        });

        reply().redirect("/displayAll");
    }
});

server.route({
    method: 'GET',
    path: '/find/{bandName}',
    handler: function (request, reply) {
        bandinfo.findOne({
            where: {
                bandName: encodeURIComponent(request.params.bandName),
            }
        }).then(function (user) {
            var currentUser = "";
            currentUser = JSON.stringify(user);
            //console.log(currentUser);
            currentUser = JSON.parse(currentUser);
            console.log(currentUser);
            reply.view('find', {
                dbresponse: currentUser
            });

        });
    }
});


server.route({
    method: 'GET',
    path: '/update/{id}',
    handler: function (request, reply) {
        var id = encodeURIComponent(request.params.id);


        reply.view('updateband', {
            routeId: id
        });
    }

});

server.route({
    method: 'POST',
    path: '/update/{id}',
    handler: function (request, reply) {
        var cm = "";
        var id = encodeURIComponent(request.params.id);
        var formresponse = JSON.stringify(request.payload);
        var parsing = JSON.parse(formresponse);
        //console.log(parsing);

        bandinfo.update(parsing, {
            where: {
                id: id
            }
        });

        reply().redirect("/displayAll");

    }

});




server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);

});


 




