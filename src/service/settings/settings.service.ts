import {Injectable} from '@nestjs/common';
import {BaseService} from '../../base/base-service';
import {IsNumber} from "class-validator";

@Injectable()
export class SettingsService extends BaseService {


    async getSettingsManyFromKeys(keys: any[]) {
        const items = await this.prisma.settings.findMany({
            where: {
                providerKey: {
                    in: keys.map(f => {
                        return f[0];
                    }),
                },
            },
        });
        let finalObject = {};
        keys.map(f => {
            const settingItem = items.find(x => x.providerKey == f[0]);
            finalObject[f[0]] = this.parseValue(settingItem ? settingItem.providerValue : f[1]);
        });
        return finalObject;
    }


    async updateSettings(providerKey, value) {
        let settingItem = await this.prisma.settings.findFirst({
            where: {
                providerKey: providerKey,
            },
        });
        if (!value)
            return;
        if (!settingItem) {
            await this.prisma.settings.create({
                data: {
                    providerKey: providerKey.toString(),
                    providerValue: value.toString(),
                },
            });
        } else {
            await this.prisma.settings.update({
                where: {
                    id: settingItem.id,
                },
                data: {
                    providerKey: providerKey,
                    providerValue: value.toString(),
                },
            });
        }

    }


    private parseValue(val: any) {
        let finalValue;
        if (val == null)
            return null;
        switch (typeof val) {
            case 'boolean':
                // @ts-ignore
                finalValue = val;
                break;
            case 'number':
                finalValue = parseInt(val + '');
                break;
            case 'string':
                if (val === 'true' || val === 'false') {
                    finalValue = val === 'true';
                } else { // @ts-ignore
                    if (isNaN(val)) {
                        finalValue = val;
                    } else { // @ts-ignore
                        if (IsNumber(val)) {
                            finalValue = parseInt(val);
                        }
                    }
                }
                break;
        }
        return finalValue;

    }


}
