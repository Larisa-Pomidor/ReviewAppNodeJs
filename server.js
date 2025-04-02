require('dotenv').config();

const express = require('express');
const { swaggerUi, swaggerDocs } = require("./swagger");
const app = express();

const path = require('path');

const cors = require('cors');
const corsOptions = require('./config/corsOptions');

const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');

const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');

const sequelize = require('./config/dbConn');

require('./model/Review');
require('./model/Developer');
require('./model/Publisher');
require('./model/Genre');
require('./model/GenresReview');
require('./model/PlatformReview');
require('./model/Section');
require('./model/Comment');
require('./model/User');
require('./model/associations');

const PORT = process.env.PORT || 8080;

sequelize.authenticate()
    .then(() => {
        console.log('Connected to PostgreSQL database successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });

sequelize.sync()
    .then(() => {
        console.log('Database synced successfully');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error syncing model:', err);
    });

// Middleware
app.use(logger);
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

app.use('/reviews', require('./routes/api/reviews'));
app.use('/publishers', require('./routes/api/publishers'));
app.use('/developers', require('./routes/api/developers'));
app.use('/genres', require('./routes/api/genres'));
app.use('/comments', require('./routes/api/comments'));
app.use('/platforms', require('./routes/api/platforms'));
app.use('/sections', require('./routes/api/sections'));

// Protected Routes


app.use('/users', require('./routes/api/users'));
app.use(verifyJWT);

app.all('*', (req, res) => {
    res.status(404).json({ "error": "404 Not Found" });
});

// Error Handling Middleware
app.use(errorHandler);