import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository, getCustomRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AdminPasswordResetEvent } from '@cqrs/events/password-reset.event';
import { AppConfigService } from '@shared/config';
import { UserStatus, UserType } from '@shared/enums';
import {
    EntityNotFoundError,
    PasswordResetTokenExpiredError,
    InvalidCredentials,
    BadRequestError,
    OtpTokenExpiredError,
    OtpTokenNotRecognizedError,
} from '@shared/errors';
import { PasswordCiper, VerificationTokenGenerator, stripPhoneNumber } from '@shared/utils';
import { ms } from '@shared/utils/ms';
import { LatLngDto } from '@service-provider/dto/lat-lng.dto';
import { AdminUserService } from '../admin-user/admin-user.service';
import { ServiceProviderService } from '../service-provider/service-provider.service';
import { AccessToken, CreateUserLoginDto, DeleteUserLoginDto, LoginCredentialDto, UpdateUserLoginDto } from './auth.dto';
import { UserLogin } from './auth.entity';
import { AccessTokenPayload } from './auth.interface';
import { PhoneVerificationRepository } from './repository/phone-verification.repository';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserLogin) public repository: Repository<UserLogin>,
        private readonly jwtService: JwtService,
        private readonly passwordCipher: PasswordCiper,
        private readonly verificationTokenGenerator: VerificationTokenGenerator,
        private readonly configService: AppConfigService,
        private readonly adminUserService: AdminUserService,
        private readonly serviceProviderService: ServiceProviderService,
        private readonly eventBus: EventBus,
    ) {}

    async validateUserLogin(userType: UserType, username: string, password: string): Promise<UserLogin> {
        const userLogin = await this.findByUsernames(userType, username);

        if (!userLogin) {
            throw new InvalidCredentials();
        }

        const checkResult = await this.passwordCipher.check(password, userLogin.passwordHash);

        if (!checkResult) {
            throw new InvalidCredentials();
        }

        delete userLogin.verificationToken;
        delete userLogin.passwordResetToken;
        delete userLogin.passwordHash;
        const { ...result } = userLogin;
        return result;
    }

    async updateLoginStatus(userLogin: UserLogin, isLogin: boolean) {
        return await this.repository.save({
            ...userLogin,
            isLogin,
        });
    }

    async login(userType: UserType, credential: LoginCredentialDto) {
        const userLogin = await this.validateUserLogin(userType, credential.username, credential.password);
        const accessToken = this.createAccessToken(userLogin);

        await this.updateLoginStatus(userLogin, true);
        return accessToken;
    }

    async logout(userId: string, userType: UserType, input: LatLngDto): Promise<boolean> {
        const userLogin = await this.repository.findOne({ userId, userType });
        if (!userLogin) {
            throw new BadRequestError();
        }

        await this.updateLoginStatus(userLogin, false);
        return this.serviceProviderService.offDuty(userId, input);
    }

    async createUserLogin(input: CreateUserLoginDto): Promise<UserLogin> {
        const userLogin = this.repository.create({
            passwordHash: await this.passwordCipher.hash(input.password),
            ...input,
        });

        return this.repository.save(userLogin);
    }

    async updateUserLogin(input: UpdateUserLoginDto): Promise<UserLogin> {
        const userLogin = await this.repository.findOne({
            where: {
                userType: input.userType,
                userId: input.userId,
            },
        });

        if (!userLogin) {
            throw new BadRequestError();
        }

        if (input.password) {
            userLogin.passwordHash = await this.passwordCipher.hash(input.password);
        }

        userLogin.username = input.username;
        userLogin.secondaryUsername = input.secondaryUsername;
        userLogin.groups = input.groups;

        return this.repository.save(userLogin);
    }

    async deleteUserLogin(input: DeleteUserLoginDto): Promise<UserLogin> {
        const userLogin = await this.repository.findOne({
            where: {
                userType: input.userType,
                userId: input.userId,
            },
        });

        if (!userLogin) {
            throw new BadRequestError();
        }

        userLogin.deletedAt = new Date();
        userLogin.deletionToken = uuidv4();

        return this.repository.save(userLogin);
    }

    async createAccessToken(userLogin: UserLogin) {
        const authorization = { groups: userLogin.groups };
        const payload = await this.buildAccessTokenPayload(userLogin.userType, userLogin.userId, authorization);
        const expiresIn = +ms(`${this.configService.authOptions.jwtTokenExpirationTime}`) / 1000;
        const refreshExpiresIn = +ms(`${this.configService.authOptions.jwtRefreshTokenExpirationTime}`) / 1000;
        const accessToken = await this.jwtService.signAsync({ typ: 'Bearer', ...payload }, { expiresIn });
        const refreshToken = await this.jwtService.signAsync({ typ: 'Refresh', ...payload }, { expiresIn: refreshExpiresIn });
        return new AccessToken(accessToken, expiresIn, refreshToken, refreshExpiresIn);
    }

    async refreshAccessToken(userType: UserType, token: string) {
        const jwtPayload: AccessTokenPayload = await this.jwtService.verifyAsync(token);
        const userLogin = await this.repository.findOne({
            where: {
                userType,
                userId: jwtPayload.sub,
            },
        });

        if (!userLogin) {
            throw new BadRequestError();
        }

        return this.createAccessToken(userLogin);
    }

    async updatePassword(userType: UserType, userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        const userLogin = await this.repository.findOne({ userId, userType }, { select: ['id', 'passwordHash'] });
        if (!userLogin) {
            throw new EntityNotFoundError('User', userId);
        }
        const isMatch = await this.passwordCipher.check(currentPassword, userLogin.passwordHash);
        if (!isMatch) {
            throw new InvalidCredentials();
        }
        userLogin.passwordHash = await this.passwordCipher.hash(newPassword);
        await this.repository.save(userLogin, { reload: false });
        return true;
    }

    async setPasswordResetToken(userType: UserType, username: string): Promise<UserLogin | undefined> {
        const userLogin = await this.findByUsernames(userType, username);

        if (!userLogin) {
            return;
        }

        const user = await this.adminUserService.findOne(userLogin.userId);

        if (!user) {
            return;
        }

        userLogin.passwordResetToken = await this.verificationTokenGenerator.generateVerificationToken();
        const result = this.repository.save(userLogin);

        if (userType === UserType.ADMIN) {
            this.eventBus.publish(new AdminPasswordResetEvent(user, userLogin.passwordResetToken));
        }

        return result;
    }

    async resetPasswordByToken(passwordResetToken: string, password: string): Promise<UserLogin | undefined> {
        const userLogin = await this.repository.findOne({
            where: { passwordResetToken },
        });
        if (userLogin) {
            if (this.verificationTokenGenerator.verifyVerificationToken(passwordResetToken)) {
                userLogin.passwordHash = await this.passwordCipher.hash(password);
                userLogin.passwordResetToken = null;
                return this.repository.save(userLogin);
            } else {
                throw new PasswordResetTokenExpiredError();
            }
        }
    }

    async resetPasswordByOtpToken(otpToken: number, phoneNumber: string, password: string): Promise<UserLogin | undefined> {
        phoneNumber = stripPhoneNumber(phoneNumber);

        const userLogin = await this.repository.findOne({
            where: { username: phoneNumber },
        });

        if (!userLogin) {
            return;
        }

        const phoneVerificationRepo = getCustomRepository(PhoneVerificationRepository);
        const extantOtpToken = await phoneVerificationRepo.getValidOtpToken(phoneNumber);
        if (!extantOtpToken || !extantOtpToken.isBeforeExpiry(moment.utc().toDate())) {
            throw new OtpTokenExpiredError();
        }

        if (extantOtpToken.otpToken !== otpToken) {
            throw new OtpTokenNotRecognizedError();
        }

        userLogin.passwordHash = await this.passwordCipher.hash(password);
        userLogin.passwordResetToken = null;
        return this.repository.save(userLogin);
    }

    async getCurrentUser(userType: UserType, userId: string) {
        if (userType === UserType.ADMIN) {
            return this.adminUserService.findOne(userId);
        } else if (userType === UserType.PROVIDER) {
            return this.serviceProviderService.findOne(userId);
        }
    }

    async getAdminPermission(userType: UserType, userId: string) {
        if (userType !== UserType.ADMIN) {
            throw new BadRequestError();
        }
        return this.adminUserService.getPermissions(userId);
    }

    private async findByUsernames(userType: UserType, username: string): Promise<UserLogin> {
        return this.repository.findOne({
            where: [
                { userType, username },
                { userType, secondaryUsername: username },
            ],
        });
    }

    private async buildAccessTokenPayload(userType: UserType, userId: string, authorization: any): Promise<AccessTokenPayload> {
        if (userType === UserType.ADMIN) {
            const adminUser = await this.adminUserService.findOne(userId);
            return {
                sub: adminUser.id,
                aud: userType.toLowerCase(),
                username: adminUser.emailAddress,
                name: adminUser.name,
                authorization,
            };
        } else if (userType === UserType.PROVIDER) {
            const serviceProvider = await this.serviceProviderService.findOne(userId);
            if (serviceProvider.generalStatus === UserStatus.BANNED) {
                throw new InvalidCredentials();
            }

            return {
                sub: serviceProvider.id,
                aud: userType.toLowerCase(),
                username: serviceProvider.phoneNumber,
                name: serviceProvider.name,
                authorization,
            };
        }
    }
}
