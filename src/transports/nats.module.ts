import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, NATS_SERVICE } from 'src/config';


const natsTransportConfig = ClientsModule.register([
    {
        name: NATS_SERVICE,
        transport: Transport.NATS, // el canal de comunicacion debe ser igual para el client-gateway y el microservicio
        options: {
            servers: envs.natsServers,
        }
    },
])

@Module({
    imports: [natsTransportConfig],
    exports: [natsTransportConfig]
})
export class NatsModule { }
