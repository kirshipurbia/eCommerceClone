import { Redis, RedisOptions } from 'ioredis';

class RedisStorage {
    setKeyExpiry(arg0: string, arg1: string) {
        throw new Error("Method not implemented.");
    }
    private client: Redis;

    constructor() {
        this.client = new Redis(this.getConfiguration());
    }

    /**
     * @description Fetch Configuration for Redis
     * @returns {RedisOptions}
     */
    private getConfiguration(): RedisOptions {
        const creds: RedisOptions = {
            db: 0, 
            host: 'localhost',
            port: 6379, // <number>config.get(Config.REDIS_PORT)
        };
        return creds;
    }

    /**
     * @description Set key in Redis
     * @param key
     * @param value
     * @returns
     */
    async setKey(key: string, value: string) {
        try {
            return await this.client.set(key, value);
        } catch (error) {
            console.log('Redis storage set', error, false);
            throw error;
        }
    }

    /**
     * @description Set key in redis with Expiry
     * @param key
     * @param value
     * @param seconds
     * @returns
     */
    async setKeyWithExpiry(key: string, value: string, seconds: number) {
        try {
            const data = await this.client.set(key, value);
            await this.setExpiry(key, seconds);
            return data;
        } catch (error) {
            console.log('Redis storage set', error, false);
            throw error;
        }
    }

    /**
     * @description Get Value from Redis by key
     * @param key
     * @returns
     */
    async getKey(key: string) {
        try {
            return await this.client.get(key);
        } catch (error) {
            console.log('Redis storage insertKeyInRedis', error, false);
            throw error;
        }
    }

    /**
     * @description Set Expiry for a key in redis
     * @param key
     * @param seconds
     * @returns
     */
    async setExpiry(key: string, seconds: number) {
        try {
            return await this.client.expire(key, seconds);
        } catch (error) {
            console.log('Redis storage insertKeyInRedis', error, false);
            throw error;
        }
    }

    /**
     * @description Delete key from Redis
     * @param key
     * @returns
     */
    async delKey(key: string) {
        try {
            return await this.client.del(key);
        } catch (error) {
            console.log('Redis storage insertKeyInRedis', error, false);
            throw error;
        }
    }

    /**
     * @description Set Hash in Redis
     * @param hashName
     * @param key
     * @param value
     * @returns
     */
    async setHash(hashName: string, key: string, value: string) {
        try {
            return await this.client.hset(hashName, key, value);
        } catch (error) {
            console.log('Redis storage insertKeyInRedis', error, false);
            throw error;
        }
    }

    /**
     * @description Get value from redis hash by field/key name
     * @param hashName
     * @param key
     * @returns
     */
    async getHash(hashName: string, key: string) {
        try {
            return await this.client.hget(hashName, key);
        } catch (error) {
            console.log('Redis storage insertKeyInRedis', error, false);
            throw error;
        }
    }

    /**
     * @description Update Field/Key value in Redis hash
     * @param hashName
     * @param key
     * @param field
     * @param value
     * @returns
     */
    async updateHash(hashName: string, key: string, field: string, value: string) {
        try {
            return await this.client.hset(hashName, key, field, value);
        } catch (error) {
            console.log('Redis storage insertKeyInRedis', error, false);
            throw error;
        }
    }

    /**
     * @description Set Hash in Redis with Expiry for a certain Field
     * @param hashName
     * @param key
     * @param value
     * @param seconds
     * @returns
     */
    async setHashWithExpiry(hashName: string, key: string, value: string, seconds: number) {
        try {
            const data = await this.client.hset(hashName, key, value);
            await this.setHashExpiry(hashName, key, seconds);
            return data;
        } catch (error) {
            console.log('Redis storage insertKeyInRedis', error, false);
            throw error;
        }
    }

    /**
     * @description Set Expiry for Field inside Redis hash
     * @param hashName
     * @param key
     * @param seconds
     * @returns
     */
    async setHashExpiry(hashName: string, key: string, seconds: number) {
        try {
            return await this.client.expire(`${hashName}:${key}`, seconds);
        } catch (error) {
            console.log('Redis storage insertKeyInRedis', error, false);
            throw error;
        }
    }

    /**
     * @description Del Specific Field/Key from Redis Hash
     * @param hashName
     * @param key
     * @returns
     */
    async delKeyFromHash(hashName: string, key: string) {
        try {
            return await this.client.hdel(hashName, key);
        } catch (error) {
            console.log('Redis storage insertKeyInRedis', error, false);
            throw error;
        }
    }

    /**
     * @description Insert data into list
     * @param key
     * @param data
     * @param ttl
     */
    async insertInList(key: string, data: any, ttl = 3600) {
        try {
            const pipeline = this.client.pipeline();
            const totalCount = data.length;
            for (let index = 0; index < totalCount; index++) {
                data[index].totalCount = totalCount;
                await pipeline.rpush(key, JSON.stringify(data[index]));
            }
            pipeline.expire(key, ttl);
            await pipeline.exec();
            return;
        } catch (error) {
            console.log('Redis storage insertKeyInRedis', error, false);
            throw error;
        }
    }

    /**
     * @description Read data from list
     * @param key
     * @param skip
     * @param limit
     */
    async readList(key: string, skip: number, limit: number) {
        try {
            return await this.client.lrange(key, skip, limit);
        } catch (error) {
            console.log('Redis storage insertKeyInRedis', error, false);
            throw error;
        }
    }
}

export const redis = new RedisStorage();
