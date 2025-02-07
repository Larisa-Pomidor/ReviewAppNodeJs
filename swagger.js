const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Review API",
            version: "1.0.0",
            description: "API documentation for the Review App",
        },
        servers: [{ url: "http://localhost:8080" }]
    },
    apis: ["./routes/*/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };