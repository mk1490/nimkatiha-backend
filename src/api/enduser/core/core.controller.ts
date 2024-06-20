import {Body, Controller, Get, NotAcceptableException, Post, UseGuards} from '@nestjs/common';
import {BaseController} from '../../../base/base-controller';
import * as fs from 'fs';
import {homedir} from 'os';
import {join} from 'path';
import {SettingsService} from '../../../service/settings/settings.service';
import {fileExistsSync} from 'tsconfig-paths/lib/filesystem';
import {CurrentUser} from "../../../base/decorators/current-user.decorator";
import {CurrentUserModel} from "../../../base/interfaces/current-user.interface";
import {ApiBearerAuth} from "@nestjs/swagger";
import {JwtAuthGuard} from "../../auth/jwt-auth-guard";
import {IncreaseDepositDto} from "./dto/increase-deposit-dto";
import {CalculateRateDto} from "./dto/calculate-rate-dto";

@Controller('core')
export class CoreController extends BaseController {


    constructor(
        private readonly settingsService: SettingsService,
    ) {
        super();
    }



}