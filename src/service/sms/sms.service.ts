import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base-service';
import axios from 'axios';
import * as process from 'process';

@Injectable()
export class SmsService extends BaseService {


  async sendOtpCode(phoneNumber, verifyCode) {

    // @ts-ignore
    if (!process.env.DEVELOPMENT_MODE || process.env.DEVELOPMENT_MODE != true) {
      await this.sendSms(phoneNumber,
        [
          {
            name: 'CODE', value: verifyCode,
          },
        ],
        100000);
    }
  }

  private async sendSms(phoneNumber, parameters, templateId) {
    return await axios.create().post('/send/verify', {
      'parameters': parameters,
      'Mobile': phoneNumber,
      'TemplateId': templateId,
    }, {
      headers: {
        'x-api-key': 'sa2ku1iAPoL5v7IlaqTwmJAEmpAI3yVltX95XBlGSAUpBodplsHw6tlldeyObL8p',
      },
      baseURL: 'https://api.sms.ir/v1',
    });
  }
}
