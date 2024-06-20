import {Body, Controller, Get, Put} from '@nestjs/common';
import {BaseController} from '../../../base/base-controller';
import {UpdateSettingsDto} from './dto/update-settings-dto';
import {SettingsService} from '../../../service/settings/settings.service';

@Controller('settings')
export class SettingsController extends BaseController {


    constructor(
        private readonly settingsService: SettingsService,
    ) {
        super();
    }


    @Get('/initialize')
    async initialize() {
        const settings = await this.settingsService.getSettingsManyFromKeys([
            ['homePage.title', null],
            ['homePage.summaryDescription', null],
        ]);
        return settings;

    }


    @Put()
    async updateSettings(@Body() input: UpdateSettingsDto) {
        
    }


}


