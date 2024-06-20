import {createParamDecorator, ExecutionContext, SetMetadata} from '@nestjs/common';
import {AppModule} from "../../app.module";
import {PrismaService} from "../../prisma.service";
import {JwtService} from "@nestjs/jwt";
import {jwtConstants} from "../../api/auth/constants";

export const UserType = createParamDecorator(async (name: string, ctx: ExecutionContext): Promise<any> => {
    // const usersService = await AppModule.moduleRef.get(UsersService);
    const jwtService = await AppModule.moduleRef.get(JwtService);
    const req = ctx.switchToHttp().getRequest<any>();
    const {headers} = req;
    const token = headers.authorization;
    const jwtUser = await jwtService.verifyAsync(token.replace('Bearer ', ''), {
        secret: jwtConstants.privateKey
    });
    // return await usersService.getUserTypeKeyByUserId(jwtUser.sub);
})

