import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '@shared/config';
import { AdminPermission } from '../admin-permission/admin-permission.entity';
import { AdminUserModule } from '../admin-user/admin-user.module';
import { ServiceProviderModule } from '../service-provider/service-provider.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { UserLogin } from './auth.entity';
import { AuthService } from './auth.service';
import { CommandHandlers } from './commands/handlers';
import { PhoneVerification } from './phone-verification.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        CqrsModule,
        AdminUserModule,
        UserModule,
        ServiceProviderModule,
        PassportModule.register({
            session: false,
            defaultStrategy: 'jwt',
        }),
        JwtModule.registerAsync({
            useFactory: (configService: AppConfigService) => ({
                secret: configService.authOptions.jwtSecretKey,
                signOptions: {
                    expiresIn: configService.authOptions.jwtTokenExpirationTime,
                },
            }),
            inject: [AppConfigService],
        }),
        TypeOrmModule.forFeature([UserLogin, AdminPermission, PhoneVerification]),
    ],
    providers: [AuthService, JwtStrategy, ...CommandHandlers],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
