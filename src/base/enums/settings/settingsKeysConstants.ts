export class SettingsKeysConstants {

    static IPG_PREFIX = 'ipg';


    static get IPG() {
        return {
            provider: SettingsKeysConstants.IPG_PREFIX + '.provider',
            merchantId: SettingsKeysConstants.IPG_PREFIX + '.merchantId',
            terminalId: SettingsKeysConstants.IPG_PREFIX + '.terminalId',
            terminalKey: SettingsKeysConstants.IPG_PREFIX + '.terminalKey',
        }
    }
}