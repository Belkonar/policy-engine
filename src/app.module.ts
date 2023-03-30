/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DataService } from './data/data.service';
import { PolicyService } from './policy/policy.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [DataService, PolicyService],
})
export class AppModule {}
