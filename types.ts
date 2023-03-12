export type RuleKind = RuleOp | RuleOr | RuleAnd;

export interface PolicyEngineRequest {
  policies: Policy[];
  data: unknown;
}

export interface Policy {
  permission: string;
  kind: 'allow' | 'deny';
  rules: RuleKind[];
}

export interface RuleOp {
  op: 'contains' | 'eq';
  src: string;
  value: any;
}

export interface RuleOr {
  or: RuleKind[];
}

export interface RuleAnd {
  and: RuleKind[];
}
