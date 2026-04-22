import dotenv from 'dotenv';
import Joi from 'joi';

// Loadding environment variables from .env file
dotenv.config();

// validation schema for environment variables
const envSchema = Joi.object({
    PORT: Joi.number().default(3000),
    DB_URL: Joi.string().required().description('MongoDB connection URL'),
    JWT_SECRET: Joi.string().required().description('JWT Secret Key'),
    JWT_EXPIRES_IN: Joi.string().default('7d').description('JWT Expiration Time')
}).unknown().required();

// Validate process.env against the schema
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

// Export the validated environment variables
export const env = {
    port: envVars.PORT,
    dbUrl: envVars.DB_URL,
    jwtSecret: envVars.JWT_SECRET,
    jwtExpiresIn: envVars.JWT_EXPIRES_IN
};
