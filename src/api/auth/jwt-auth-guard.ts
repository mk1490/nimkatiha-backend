import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

export class JwtAuthGuard extends AuthGuard('jwt') {

    handleRequest(err, user, info) {
        if (err || !user) {
          throw new UnauthorizedException({
            message: 'ورود به سیستم و احراز هویت الزامی است!',
            error: 'TOKEN_EXPIRED',
            statusCode: 401
          });
        }
        return user;
    }
}
