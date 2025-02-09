import { Controller, Get, Query } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';

@Controller('core')
export class CoreController extends BaseController {


  constructor() {
    super();
  }
}
