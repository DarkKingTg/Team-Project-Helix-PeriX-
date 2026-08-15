import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './email.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [AuthController],
  providers: [AuthGuard, RolesGuard, AuthService, EmailService],
  exports: [AuthGuard, RolesGuard, AuthService, EmailService],
})
export class AuthModule {}
