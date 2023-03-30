import { Test, TestingModule } from '@nestjs/testing';
import { PolicyService } from './policy.service';
import { DataService } from '../data/data.service';
import { Policy, PolicyDocument, RuleKind } from '../../types';
import { Collection, FindCursor, WithId } from 'mongodb';

describe('PolicyService', () => {
  let service: PolicyService;

  const collection: Collection<PolicyDocument> =
    {} as Collection<PolicyDocument>;

  const dataService: DataService = {
    policies(): Collection<PolicyDocument> {
      return collection;
    },
  } as DataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PolicyService,
        { provide: DataService, useValue: dataService },
      ],
    }).compile();

    service = module.get<PolicyService>(PolicyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update document', async () => {
    const body = {
      key: 'global',
      policies: [],
    };

    collection.replaceOne = jest.fn(async () => body);

    const response = await service.updateDocument(body);
    expect(response).toBe(body);
  });

  it('should get all', async () => {
    const orgs: FindCursor<WithId<PolicyDocument>> = {
      toArray: async () => {
        return [
          {
            key: 'org-admins',
            policies: [
              {
                permission: 'org.*',
                rules: [{ op: 'true' }],
              },
            ],
          },
        ];
      },
    } as FindCursor<WithId<PolicyDocument>>;

    collection.find = jest.fn(async () => orgs) as any;

    await service.getAll();
  });

  it('should get one', async () => {
    collection.findOne = jest.fn(async () => ({})) as any;

    await service.getOne('key');
  });

  it('should update document with YAML', async () => {
    const yaml = `
permission: '*'
rules:
    - op: contains
      src: $.global_roles
      value: admin
---
`;
    const body = {
      key: 'global',
      yaml,
      policies: [],
    };

    collection.replaceOne = jest.fn(async () => body);

    const response = await service.updateDocument(body);
    expect(response).toBe(body);
    expect(response.policies.length).toBe(1);
    expect(response.policies[0].permission).toBe('*');
  });

  it('policies by namespace', async () => {
    const globals: FindCursor<WithId<PolicyDocument>> = {
      toArray: async () => {
        return [
          {
            key: 'global-admins',
            policies: [
              {
                permission: '*',
                rules: [{ op: 'true' }],
              },
            ],
          },
        ];
      },
    } as FindCursor<WithId<PolicyDocument>>;

    const orgs: FindCursor<WithId<PolicyDocument>> = {
      toArray: async () => {
        return [
          {
            key: 'org-admins',
            policies: [
              {
                permission: 'org.*',
                rules: [{ op: 'true' }],
              },
            ],
          },
        ];
      },
    } as FindCursor<WithId<PolicyDocument>>;

    const documents: Record<string, FindCursor<WithId<PolicyDocument>>> = {
      global: globals,
      org: orgs,
    };

    collection.find = jest.fn(
      async ({ namespace }: { namespace: string }) => documents[namespace],
    ) as any;

    const response = await service.getPoliciesByNamespace('global.org');

    expect(response.length).toBe(2);
    expect(response[0].permission).toBe('*');
    expect(response[0].from).toBe('global-admins');
  });

  it('policy by key', async () => {
    const key = 'global-admins';

    collection.findOne = jest.fn(async () => ({})) as any;
    await service.getPolicyByKey(key);

    expect(collection.findOne).toBeCalledWith({ key });
  });

  it('engine', () => {
    const data = {
      name: 'bob',
    };

    const policies: Policy[] = [
      {
        permission: '*',
        kind: 'allow',
        rules: [
          {
            op: 'true',
            src: '',
            value: '',
          },
        ],
      },
    ];

    const response = service.runEngine(data, policies);
    expect(response.length).toBe(1);
    expect(response[0]).toBe('*');
  });

  it('engine defaults', () => {
    const data = {
      name: 'bob',
    };

    const policies: Policy[] = [
      {
        permission: '*',
        kind: 'allow',
        rules: null,
      },
    ];

    const responseBlank = service.runEngine(data, null);
    expect(responseBlank.length).toBe(0);

    const response = service.runEngine(data, policies);
    expect(response.length).toBe(0);
  });

  describe('Rules', () => {
    const data = {
      name: 'bob',
      groups: ['a', 'b'],
    };

    const dataOne = {
      groups: ['c', 'b'],
    };

    const dataNone = {
      groups: ['c', 'd'],
    };

    describe('op', () => {
      it('op works', () => {
        const response = service.executeRule(data, {
          op: 'contains',
          src: '$.groups',
          value: 'a',
        });

        expect(response).toBeTruthy();
      });

      it('op eq works', () => {
        const response = service.executeRule(data, {
          op: 'eq',
          src: '$.name',
          value: 'bob',
        });

        expect(response).toBeTruthy();
      });

      it('negative op works', () => {
        const response = service.executeRule(data, {
          op: 'contains',
          src: '$.groups',
          value: 'c',
        });

        expect(response).toBeFalsy();
      });

      it('missing value works', () => {
        const response = service.executeRule(data, {
          op: 'contains',
          src: '$.users',
          value: 'c',
        });

        expect(response).toBeFalsy();
      });
    });

    const rules: RuleKind[] = [
      {
        op: 'contains',
        src: '$.groups',
        value: 'a',
      },
      {
        op: 'contains',
        src: '$.groups',
        value: 'b',
      },
    ];

    describe('or', () => {
      const rule: RuleKind = {
        or: rules,
      };

      it('both positive', () => {
        const response = service.executeRule(data, rule);

        expect(response).toBeTruthy();
      });

      it('one positive', () => {
        const response = service.executeRule(dataOne, rule);

        expect(response).toBeTruthy();
      });

      it('zero positive', () => {
        const response = service.executeRule(dataNone, rule);

        expect(response).toBeFalsy();
      });
    });

    describe('and', () => {
      const rule: RuleKind = {
        and: rules,
      };

      it('both positive', () => {
        const response = service.executeRule(data, rule);

        expect(response).toBeTruthy();
      });

      it('one positive', () => {
        const response = service.executeRule(dataOne, rule);

        expect(response).toBeFalsy();
      });

      it('zero positive', () => {
        const response = service.executeRule(dataNone, rule);

        expect(response).toBeFalsy();
      });
    });
  });
});
