import {HttpException, HttpStatus, Injectable, UnauthorizedException} from '@nestjs/common';
import {jwtConstants} from "./constants";
import {LoginDto} from "./dto/login-dto";
import {JwtService} from "@nestjs/jwt";
import {BaseService} from "../../base/base-service";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService extends BaseService {


    constructor(
        private readonly jwtService: JwtService
    ) {
        super();
    }

    async login(input: LoginDto, isAdmin) {
        const accessPermissionItems = await this.prisma.access_permission_group.findMany({
            where: {
                name: {
                    in: isAdmin ? ['admin', 'operator'] : ['customer']
                },
            }
        });

        let userItem = await this.prisma.users.findFirst({
            where: {
                username: input.username,
            }
        })

        const accessPermissionItem = await this.prisma.access_permission_group.findFirst({
            where:{
                id: userItem.accessPermissionGroupId
            }
        })

        if (!accessPermissionItem) {
            this.handleUserInvalid()
        }


        if (!userItem)
            this.handleUserInvalid()


        if (!bcrypt.compareSync(input.password, userItem.password))
            throw new HttpException(
                {
                    code: "PASSWORD_NOT_VALID",
                    message: "کلمۀ عبور وارد شده معتبر نیست!"
                }, HttpStatus.UNAUTHORIZED);

        const payload = {
            username: userItem.username,
            sub: userItem.id,
            type: 'normal',
        };

        return {
            access_token: this.jwtService.sign(payload, {
                secret: jwtConstants.privateKey,
                expiresIn: '6h'
            }),

        }
    }

    private handleUserInvalid = () => {
        throw new HttpException({
            code: "USERNAME_NOT_VALID",
            message: "نام کاربری وارد شده معتبر نیست!"
        }, HttpStatus.UNAUTHORIZED);
    }
}
