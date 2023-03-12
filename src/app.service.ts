import { Injectable } from '@nestjs/common';
import * as jp from 'jsonpath';

@Injectable()
export class AppService {
  getHello(): string {
    console.log(
      jp.value(
        {
          groups: ['a', 'b'],
        },
        '$.groups',
      ),
    );

    return 'Hello World!';
  }
}
