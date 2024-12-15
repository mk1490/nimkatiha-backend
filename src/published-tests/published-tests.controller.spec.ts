import { Test, TestingModule } from '@nestjs/testing';
import { PublishedTestsController } from './published-tests.controller';

describe('PublishedTestsController', () => {
  let controller: PublishedTestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishedTestsController],
    }).compile();

    controller = module.get<PublishedTestsController>(PublishedTestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
