import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ModuleRef, RouterModule} from "@nestjs/core";
import {AdminModule} from "./api/admin/admin.module";
import {PrismaService} from "./prisma.service";
import {AuthController} from "./api/auth/auth.controller";
import {AuthService} from "./api/auth/auth.service";
import {JwtModule, JwtService} from "@nestjs/jwt";
import {jwtConstants} from "./api/auth/constants";
import {JwtStrategy} from "./api/auth/jwt-strategy";
import {UsersService} from "./service/users/users.service";
import {SmsService} from "./service/sms/sms.service";
import {HelperService} from "./service/helper/helper.service";
import {EnduserModule} from "./api/enduser/enduser.module";
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from "path";
import {homedir} from "os";
import {AccessPermissionService} from "./service/access-permission/access-permission.service";
import {NotificationService} from "./service/notification/notification.service";
import { PublishedTestsController } from './published-tests/published-tests.controller';

@Module({
    imports: [
        JwtModule.register({
            secret: jwtConstants.privateKey,
            privateKey: jwtConstants.privateKey,
            secretOrPrivateKey: jwtConstants.privateKey,
            signOptions: {expiresIn: "60m"}
        }),
        AdminModule,
        EnduserModule,
        RouterModule.register([
            {
                path: "admin",
                module: AdminModule
            },
            {
                path: "enduser",
                module: EnduserModule
            },
        ]),
        ServeStaticModule.forRoot({
            serveRoot: "/api/public-files",
            rootPath: join(homedir(), "/dastafarinan/public"),
            exclude: ["/api*"]
        }),
    ],
    controllers: [
        AppController,
        AuthController,
        PublishedTestsController,
    ],
    providers: [
        AppService,
        PrismaService,
        AuthService,
        JwtService,
        JwtStrategy,
        UsersService,
        SmsService,
        HelperService,
        AccessPermissionService,
        NotificationService,
    ],
})
export class AppModule {
    static moduleRef: ModuleRef;

    constructor(
        moduleRef: ModuleRef
    ) {
        AppModule.moduleRef = moduleRef;
    }
}
