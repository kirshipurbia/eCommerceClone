import dotenv from 'dotenv'
import { NODEMAILER_CONFIG } from './src/constant/constants'

dotenv.config()

export const nodemailerConfig = {
    SERVICE : String(process.env.SERVICE),
    USER : String(process.env.USER),
    PASS : String(process.env.PASS)
}

export const SECRETKEY = String(process.env.SECRET_KEY)

export const Mongo_connection = String(process.env.MONGO_CONNECTION)