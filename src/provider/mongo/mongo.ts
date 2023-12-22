import mongoose, { ConnectOptions, Connection, createConnection } from 'mongoose';
import { Mongo_connection } from '../../../dotenvConfig';
class MongoConnection {
    private conn!: Connection;
    constructor() {
        this.initiateMongoConnection();
    }

    initiateMongoConnection() {
        if (!this.conn) {
            const options: ConnectOptions = {};
            this.conn = createConnection(this.getConnectionUri(), options);
            this.registerConnectionEvent();
            mongoose.set('debug', true);
        }
    }
    getConnectionUri() {
        return Mongo_connection;
    }
    private registerConnectionEvent() {
        this.conn.on('error', console.error.bind(console, 'MongoDB connection error:'));
        this.conn.once('open', () => {
            console.log('MongoDB connected successfully!,\nconnected to ', this.getConnectionUri());
        });
    }

    getConnection(): Connection {
        return this.conn;
    }
}

export const mongo = new MongoConnection();
