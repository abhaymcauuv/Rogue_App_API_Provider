/* eslint-disable no-unused-vars */
import path from 'path'
import merge from 'lodash/merge'

/* istanbul ignore next */
const requireProcessEnv = (name) => {
    if (!process.env[name]) {
        throw new Error('You must set the ' + name + ' environment variable')
    }
    return process.env[name]
}

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv-safe')
    dotenv.load({
        path: path.join(__dirname, '../../.env'),
        sample: path.join(__dirname, '../../.env.example')
    })
}

const config = {
    all: {
        env: process.env.NODE_ENV || 'development',
        root: path.join(__dirname, '..'),
        port: process.env.PORT || 7000,
        ip: process.env.IP || 'localhost',
        apiRoot: process.env.API_ROOT || '',
        masterKey: requireProcessEnv('MASTER_KEY'),
        jwtSecret: requireProcessEnv('JWT_SECRET'),
        mongo: {
            options: {
                db: {
                    safe: true
                }
            }
        }
    },
    test: {
        mongo: {
            uri: 'mongodb://localhost/rogue_app',
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        },
        dbconnection: {
            config: {
            }
        }
    },
    development: {
        mongo: {
            uri: 'mongodb://localhost/rogue_app',
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        },
        dbconnection: {
            config: {
                user: 'chalkcouture',
                password: 'B9V6~10|PX7v',
                server: 'exigosqlsyncsandbox.c61qznpqe2o1.us-west-1.rds.amazonaws.com',
                database: 'sandbox',
                port: 4433
            }
        }
    },
    production: {
        ip: process.env.IP || undefined,
        port: process.env.PORT || 8080,
        mongo: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost/rogue_app'
        },
        dbconnection: {
            config: {

            }
        }
    }
}

module.exports = merge(config.all, config[config.all.env])
export default module.exports

