import { Injectable } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import { PolicyDocument } from '../../types';

@Injectable()
export class DataService {
  client = new MongoClient('mongodb://127.0.0.1:27017');
  database = this.client.db('policy-engine');

  collection<T>(name: string): Collection<T> {
    return this.database.collection<T>(name);
  }

  policies(): Collection<PolicyDocument> {
    return this.collection<PolicyDocument>('policies');
  }
}
