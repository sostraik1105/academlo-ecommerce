const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const db = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    logging: false,
    dialectOptions:
        process.env.NODE_ENV === 'production'
            ? {
                  ssl: {
                      required: true,
                      rejectUnauthorized: false,
                  },
              }
            : {},
});

module.exports = { db, DataTypes };
