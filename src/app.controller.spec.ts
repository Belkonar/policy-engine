import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PolicyService } from './policy/policy.service';
import { Policy } from '../types';

describe('AppController', () => {
  let appController: AppController;
  let policyService: PolicyService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: PolicyService, useValue: {} }],
    }).compile();

    appController = app.get<AppController>(AppController);
    policyService = app.get<PolicyService>(PolicyService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
    const response = appController.health();
    expect(response.status).toBe('ok');
  });

  it('get all', async () => {
    policyService.getAll = jest.fn(async () => []);

    await appController.getAll();

    expect(policyService.getAll).toHaveBeenCalled();
  });

  it('get one', async () => {
    policyService.getOne = jest.fn(async () => ({})) as any;

    await appController.getOne('key');

    expect(policyService.getOne).toHaveBeenCalledWith('key');
  });

  it('should update document', async () => {
    policyService.updateDocument = jest.fn(async (x) => x);

    const response = await appController.updateDocument({
      key: 'global-admins',
      policies: [],
    });

    expect(response.namespace).toBe('global');
    expect(response.ordinal).toBe(1);
    expect(response.yaml).toBeNull();
  });

  it('should sync', async () => {
    policyService.updateDocument = jest.fn(async (x) => x);

    const requestData = [
      {
        key: 'global-admins',
        policies: [],
      },
      {
        key: 'org-admins',
        policies: [],
      },
    ];

    await appController.syncDocuments(requestData);

    expect(policyService.updateDocument).toHaveBeenCalledTimes(2);
  });

  it('should get namespaces', async () => {
    policyService.getPoliciesByNamespace = jest.fn(async () => []);

    await appController.getPoliciesByNamespace('hi');

    expect(policyService.getPoliciesByNamespace).toHaveBeenCalled();
  });

  describe('engine', () => {
    const data = {
      groups: ['a', 'b'],
    };

    it('regular', async () => {
      policyService.runEngine = jest.fn(() => []);

      const response = await appController.runEngine({
        data,
      });

      expect(response.length).toBe(0);
    });

    it('namespace empty', async () => {
      policyService.runEngine = jest.fn(() => []);
      policyService.getPoliciesByNamespace = jest.fn(async () => []);

      const response = await appController.runEngine({
        data,
        namespace: 'bob',
      });

      expect(response.length).toBe(1);
      expect(response[0]).toBe('*');
    });

    it('policy empty', async () => {
      policyService.runEngine = jest.fn(() => []);
      policyService.getPolicyByKey = jest.fn(
        async (): Promise<Policy> => ({} as Policy),
      );

      const response = await appController.runEngine({
        data,
        policy: 'global',
      });

      expect(response.length).toBe(0);
    });
  });
});
