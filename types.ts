export type RuleKind = RuleOp | RuleOr | RuleAnd;

export interface PolicyEngineRequest {
  policies?: Policy[];
  namespace?: string;
  policy?: string;
  data: unknown;
}

export interface PolicyDocument {
  key: string;
  namespace: string;
  ordinal: number;
  policies: Policy[];
  yaml?: string;
}

export interface Policy {
  permission: string;
  kind: 'allow' | 'deny';
  rules: RuleKind[];
}

export interface PolicyFrom extends Policy {
  from: string;
}

export interface RuleOp {
  op: 'contains' | 'eq' | 'true';
  src: string;
  value: any;
}

export interface RuleOr {
  or: RuleKind[];
}

export interface RuleAnd {
  and: RuleKind[];
}
