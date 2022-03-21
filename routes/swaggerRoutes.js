const swaggerRouter = require('express').Router();

//Sets up documentaiton dependancies
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
        info:{
            title: 'Customer API',
            description: 'Customer API Information',
            contact:{
                name: 'Amazing Developer'
            },
            servers: ["http://localhost:8080"]

        }
    },

    apis: ['eventRoutes', 'userRoutes', 'emailRoutes']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
swaggerRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = swaggerRouter;