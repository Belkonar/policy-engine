import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Policy, PolicyDocument, PolicyEngineRequest } from '../types';

import { PolicyService } from './policy/policy.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly policyService: PolicyService,
  ) {}

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
