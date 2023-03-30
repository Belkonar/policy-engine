import { Test, TestingModule } from '@nestjs/testing';
import { DataService } from './data.service';
import { ConfigService } from '@nestjs/config';

describe('DataService', () => {
  let service: DataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataService, ConfigService],
    }).compile();

    service = module.get<DataService>(DataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should pull collection', () => {
    const response = service.policies();
    expect(response).toBeDefined();
  });
});
