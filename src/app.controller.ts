import { Controller } from '@nestjs/common';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { rimraf } from 'rimraf';
import { jwtConstants } from './api/auth/constants';
import { readFileSync } from 'fs';
import { HelperService } from './service/helper/helper.service';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly helper: HelperService,
  ) {
  }

}
