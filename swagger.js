const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
    title: 'Employee info api',
    description: 'employees'
    },
    host: 'http://localhost:5000'
};

const outputFile = '../swagger-output.json';
const routes = ['./Server.js'];


/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);