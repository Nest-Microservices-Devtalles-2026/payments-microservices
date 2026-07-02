import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    NATS_SERVERS: string[];
    STRIPE_SECRET: string;
    STRIPE_SUCCESS_URL: string;
    STRIPE_CANCEL_URL: string;
    ENDPOINT_SECRET_TESTING: string;
    ENDPOINT_SECRET_OFFICIAL: string;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    STRIPE_SECRET: joi.string().required(),
    STRIPE_SUCCESS_URL: joi.string().required(),
    STRIPE_CANCEL_URL: joi.string().required(),
    ENDPOINT_SECRET_TESTING: joi.string().required(),
    ENDPOINT_SECRET_OFFICIAL: joi.string().required()
})
.unknown(true)

const { error, value } = envsSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (error) {
    throw new Error(`Config validation error: ${ error.message }`);
}

const envVars: EnvVars = value;

export const envs = {
    port: envVars.PORT,
    natsServers: envVars.NATS_SERVERS,
    stripeSecret: envVars.STRIPE_SECRET,
    stripeSuccessURL: envVars.STRIPE_SUCCESS_URL,
    stripecancelURL: envVars.STRIPE_CANCEL_URL,
    endpointSecretTesting: envVars.ENDPOINT_SECRET_TESTING,
    endpointSecretOfficial: envVars.ENDPOINT_SECRET_OFFICIAL
}

