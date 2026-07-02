import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'node_modules/@types/express';
import { metadata } from 'node_modules/reflect-metadata/no-conflict';
import { ClientProxy } from 'node_modules/@nestjs/microservices';


@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripeSecret);
    private readonly logger = new Logger('PaymentsService');

    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy  
    ){}

    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {

        const { currency, items, orderId } = paymentSessionDto;

        const lineItems = items.map(item => {
            return {
                price_data: {
                    currency,
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100), // equivale a 20 dolares ya que se manda un entero que ya tiene decimales 2000 / 100 = 20.00
                },
                quantity: item.quantity
            }
        })


        const session = await this.stripe.checkout.sessions.create({

            // colocar aqui el ID de mi orden
            payment_intent_data: {

                /**
                 * En la metada podemos colocar cualquier cosa que 
                 * queramos
                 */
                metadata: {
                    orderId
                }
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: envs.stripeSuccessURL,
            cancel_url: envs.stripecancelURL,
        });

        // return session;
        return {
            cancelUrl: session.cancel_url,
            successUrl: session.success_url,
            url: session.url
        }
    }

    async stripeWebhook(req: Request, res: Response) {

        // Usar este (A manera de prueba LOCAL) para probar con el CLI de stripe desde local
        // const stripeEndpointSecret = envs.endpointSecretTesting;

        // Usar este (A manera de comunicacion REAL entre stripe y nuestro webhook) para probar con la plataforma de stripe 
        const stripeEndpointSecret = envs.endpointSecretOfficial;
        let event;

        if (stripeEndpointSecret) {
            const signature = req.headers['stripe-signature'] as string;

            if (!signature) {
                return res.status(400).send('Webhook signature missing');
            }
            console.log('signature', signature);

            try {

                console.log({
                    rawBody: req['rawBody'],
                    signature,
                    stripeEndpointSecret
                })

                event = this.stripe.webhooks.constructEvent(
                    req['rawBody'],
                    signature,
                    stripeEndpointSecret
                );

                switch (event.type) {
                    case 'charge.succeeded':

                        const chargeSucceeded = event.data.object;
                        // TODO: call to microservices
                        const payload = {
                            stripePaymentId: chargeSucceeded.id,
                            orderId: chargeSucceeded.metadata.orderId,
                            receiptUrl: chargeSucceeded.receipt_url
                        }

                        this.logger.log({
                            payload
                        })

                        console.log('llego aqui')
                        this.client.emit('payment.succeded', payload);

                        break;

                    default:
                        console.log(`Event ${event.type} not handle`);
                }


            } catch (error) {
                res.status(400).send(`⚠️ Webhook signature verification failed.${error}`)
                return;
            }

            return res.status(200).json({
                signature
            })
        }
    }
}
