import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { createDb } from '@life-rpg/database';
import { AuthController } from './auth.controller';
import { TokenService } from './token.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: (Number(process.env.ACCESS_TOKEN_EXPIRY_MINUTES) || 15) * 60,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => createDb(process.env.DATABASE_URL!),
    },
    TokenService,
    JwtStrategy,
  ],
  exports: [TokenService],
})
export class AuthModule {}
