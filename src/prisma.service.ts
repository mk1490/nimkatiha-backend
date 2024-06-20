import {INestApplication, Injectable, OnApplicationShutdown, OnModuleInit} from '@nestjs/common';
import { PrismaClient } from '../models';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
    [x: string]: any;
    async onModuleInit() {
        await this.$connect();
    }

    
    async enableShutdownHooks(app: INestApplication) {
        // this.$on(EventType, async () => {
        //     await app.close();
        // });
    }

    onApplicationShutdown(signal?: string): any {

    }
}
