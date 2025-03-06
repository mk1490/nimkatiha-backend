import { createParamDecorator, ExecutionContext, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../api/auth/constants';
import { PrismaService } from '../../prisma.service';
import { CurrentUserModel } from '../interfaces/current-user.interface';
import { UsersService } from '../../service/users/users.service';
import { AccessPermissionService } from '../../service/access-permission/access-permission.service';
import to from 'await-to-js';

export const CurrentCoach = createParamDecorator(async (name: string, ctx: ExecutionContext): Promise<any> => {
  const prismaService = await AppModule.moduleRef.get(PrismaService);
  const jwtService = await AppModule.moduleRef.get(JwtService);
  const req = ctx.switchToHttp().getRequest<any>();
  const { headers } = req;
  const token = headers.authorization;
  if (!!token) {
    const [err, payload] = await to(jwtService.verifyAsync(token.replace('Bearer ', ''), {
      secret: jwtConstants.privateKey,
    }));
    if (!err) {
      const coachItem = await prismaService.coachs.findFirst({
        where: {
          id: payload.sub,
        },
      });
      if (!coachItem)
        return null;
      return coachItem;
    } else
      return null;
  } else {
    return null;
  }


});


