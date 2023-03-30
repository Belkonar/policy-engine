import { Injectable } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import { PolicyDocument } from '../../types';

@Injectable()
export class DataService {
  client = new MongoClient('mongodb://127.0.0.1:27017');
  database = this.client.db('policy-engine');

  policies(): Collection<PolicyDocument> {
    return this.database.collection<PolicyDocument>('policies');
  }
}
