import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
import {
  Policy,
  PolicyDocument,
  RuleAnd,
  RuleKind,
  RuleOp,
  RuleOr,
} from '../../types';
import * as jp from 'jsonpath';
import { parseAllDocuments } from 'yaml';

@Injectable()
export class PolicyService {
  constructor(private readonly dataService: DataService) {}

  async updateDocument(body: PolicyDocument): Promise<PolicyDocument> {
    if (body.yaml !== null) {
      body.policies = parseAllDocuments(body.yaml)
        .map((x) => x.toJS())
        .filter((x) => x !== null);
    }

    const collection = this.dataService.policies();

    const filter = { key: body.key };

    await collection.replaceOne(filter, body, {
      upsert: true,
    });

    return body;
  }

  async getPoliciesByNamespace(ns: string): Promise<Policy[]> {
    let policies: Policy[] = [];

    const nsParts = ns.split('.');

    const collection = this.dataService.policies();

    for (const namespace of nsParts) {
      const filter = { namespace };
      const response = await collection.find(filter, {
        sort: { ordinal: 1 },
      });

      const items = (await response.toArray()).flatMap((x) => x.policies);

      policies = [...policies, ...items];
    }

    return policies;
  }

  async getPolicyByKey(key: string): Promise<Policy> {
    const collection = this.dataService.policies();

    const filter = { key };

    return await collection.findOne<Policy>(filter);
  }

  runEngine(data: any, policies: Policy[]): string[] {
    const permissions: string[] = [];

    for (const policy of policies || []) {
      for (const rule of policy.rules || []) {
        const input = {
          permissions,
          ...data,
        };

        if (this.executeRule(input, rule)) {
          permissions.push(policy.permission);
          break;
        }
      }
    }

    return permissions;
  }

  executeRule(input: unknown, rule: RuleKind): boolean {
    if (isOp(rule)) {
      if (rule.op === 'true') {
        return true;
      }

      const obj = jp.value(input, rule.src);

      if (obj === null || obj === undefined) {
        return false;
      }

      if (rule.op === 'eq' && obj === rule.value) {
        return true;
      }

      if (rule.op === 'contains' && obj.indexOf(rule.value) !== -1) {
        return true;
      }
    } else if (isOr(rule)) {
      for (const subRule of rule.or) {
        if (this.executeRule(input, subRule)) {
          return true;
        }
      }

      return false;
    } else if (isAnd(rule)) {
      for (const subRule of rule.and) {
        if (!this.executeRule(input, subRule)) {
          return false;
        }
      }

      return true;
    }
  }
}

function isOp(rule: RuleKind): rule is RuleOp {
  return (rule as RuleOp).op !== undefined;
}

function isOr(rule: RuleKind): rule is RuleOr {
  return (rule as RuleOr).or !== undefined;
}

function isAnd(rule: RuleKind): rule is RuleAnd {
  return (rule as RuleAnd).and !== undefined;
}
