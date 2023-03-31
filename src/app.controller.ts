import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Policy, PolicyDocument, PolicyEngineRequest } from '../types';

import { PolicyService } from './policy/policy.service';

@Controller()
export class AppController {
  constructor(private readonly policyService: PolicyService) {}

  /**
   * This method is strictly for load balancers.
   */
  @Get('health')
  health(): any {
    return {
      status: 'ok',
    };
  }

  @Get()
  async getAll(): Promise<PolicyDocument[]> {
    return await this.policyService.getAll();
  }

  @Get(':key')
  async getOne(@Param('key') key: string): Promise<PolicyDocument> {
    return await this.policyService.getOne(key);
  }

  // TODO: Also delete other ones optionally
  @Put('sync')
  async syncDocuments(@Body() body: PolicyDocument[]) {
    for (const doc of body) {
      await this.updateDocument(doc);
    }
  }

  @Put('document')
  async updateDocument(@Body() body: PolicyDocument): Promise<PolicyDocument> {
    const document: PolicyDocument = {
      ordinal: 1,
      yaml: null,
      ...body,
    };

    document.namespace = document.key.split('-')[0];

    return await this.policyService.updateDocument(document);
  }

  @Post()
  async runEngine(@Body() body: PolicyEngineRequest): Promise<string[]> {
    if (body.namespace) {
      body.policies = await this.policyService.getPoliciesByNamespace(
        body.namespace,
      );

      if (body.policies.length == 0) {
        return ['*'];
      }
    }

    if (body.policy) {
      const policy = await this.policyService.getPolicyByKey(body.policy);
      body.policies = [];

      if (policy) {
        body.policies.push(policy);
      }
    }

    return this.policyService.runEngine(body.data, body.policies);
  }

  @Get('namespace')
  async getPoliciesByNamespace(@Query('ns') ns: string): Promise<Policy[]> {
    return await this.policyService.getPoliciesByNamespace(ns);
  }
}
