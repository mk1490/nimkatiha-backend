import {Body, Controller, Get, Put, UseGuards} from '@nestjs/common';
import {BaseController} from "../../../base/base-controller";
import {UpdateIpgDto} from "./dto/update-ipg-dto";
import {SettingsService} from "../../../service/settings/settings.service";
import {SettingsKeysConstants} from "../../../base/enums/settings/settingsKeysConstants";
import {ApiBearerAuth} from "@nestjs/swagger";
import {Roles} from "../../auth/roles.decorator";
import {JwtAuthGuard} from "../../auth/jwt-auth-guard";
import {RolesGuard} from "../../auth/roles-guard";

@Controller('setting-ipg')
export class SettingIpgController extends BaseController {


    constructor(
        private readonly settingService: SettingsService,
    ) {
        super();
    }

    @Get('/initialize')
    @ApiBearerAuth()
    @Roles( 'ipg_management.update', 'ipg_management.create', 'ipg_management.delete')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async initialize() {
        const initializeSettings = await this.settingService.getSettingsManyFromKeys([
            [SettingsKeysConstants.IPG.provider, null],
            [SettingsKeysConstants.IPG.terminalKey, null],
            [SettingsKeysConstants.IPG.terminalId, null],
            [SettingsKeysConstants.IPG.merchantId, null],
        ])
        return {
            ipgProvider: initializeSettings[SettingsKeysConstants.IPG.provider],
            terminalKey: initializeSettings[SettingsKeysConstants.IPG.terminalKey],
            terminalId: initializeSettings[SettingsKeysConstants.IPG.terminalId],
            merchantId: initializeSettings[SettingsKeysConstants.IPG.merchantId],
        }
    }


    @Put()
    @ApiBearerAuth()
    @Roles( 'ipg_management.update')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateIpgSettings(@Body() input: UpdateIpgDto) {
        await this.settingService.updateSettings(SettingsKeysConstants.IPG.provider, input.ipgProvider);
        await this.settingService.updateSettings(SettingsKeysConstants.IPG.terminalId, input.terminalId);
        await this.settingService.updateSettings(SettingsKeysConstants.IPG.terminalKey, input.terminalKey);
        await this.settingService.updateSettings(SettingsKeysConstants.IPG.merchantId, input.merchantId);
    }
}
