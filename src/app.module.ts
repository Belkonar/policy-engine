import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataService } from './data/data.service';
import { PolicyService } from './policy/policy.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DataService, PolicyService],
})
export class AppModule {}
