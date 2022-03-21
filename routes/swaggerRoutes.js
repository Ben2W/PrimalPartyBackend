const swaggerRouter = require('express').Router();

//Sets up documentaiton dependancies
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Extended: https://swagger.io/specification/#infoObject
// Info on documenting https://dev.to/kabartolo/how-to-document-an-express-api-with-swagger-ui-and-jsdoc-50do
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info:{
            title: 'PrimalParty API',
            description: 'PrimalParty API Information',
            contact:{
                name: 'bewerner23@gmail.com'
            },
            servers: ["http://localhost:8080", "https://primalpartybackend.azurewebsites.net/"]

        }
    },

    apis: ["./routes/eventRoutes.js", "./routes/userRoutes.js", "./routes/emailRoutes.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
swaggerRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = swaggerRouter;