import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PolicyEngineRequest, RuleKind, RuleOp } from "../types";
import * as jp from 'jsonpath';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  runEngine(@Body() body: PolicyEngineRequest): string[] {
    const permissions: string[] = [];

    for (const policy of body.policies || []) {
      for (const rule of policy.rules || []) {
        if (isOp(rule)) {
          const input = {
            permissions,
            data: body.data,
          };

          const obj = jp.value(input, rule.src);

          if (rule.op === 'eq' && obj === rule.value) {
            permissions.push(policy.permission);
            break;
          }

          if (rule.op === 'contains' && obj.indexOf(rule.value) !== -1) {
            permissions.push(policy.permission);
            break;
          }
        }
      }
    }

    return permissions;
  }
}

function isOp(rule: RuleKind): rule is RuleOp {
  return (rule as RuleOp).op !== undefined;
}
