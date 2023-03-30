import { Injectable } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import { PolicyDocument } from '../../types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DataService {
  client = new MongoClient(
    this.configService.get('DATABASE_HOST', 'mongodb://127.0.0.1:27017'),
  );

  database = this.client.db('policy-engine');

  constructor(private configService: ConfigService) {}

  policies(): Collection<PolicyDocument> {
    return this.database.collection<PolicyDocument>('policies');
  }
}
