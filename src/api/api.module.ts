import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UrlModule } from './url/url.module';

@Module({
  imports: [UserModule, UrlModule],
})
export class ApiModule {}
