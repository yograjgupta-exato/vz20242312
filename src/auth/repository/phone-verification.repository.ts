import { Repository, EntityRepository } from 'typeorm';
import { PhoneVerification } from '../phone-verification.entity';

@EntityRepository(PhoneVerification)
export class PhoneVerificationRepository extends Repository<PhoneVerification> {
    async getValidOtpToken(phoneNumber: string): Promise<PhoneVerification> {
        const extantOtpToken = await this.createQueryBuilder('verification')
            .where('verification.phone_number = :phoneNumber', { phoneNumber })
            .andWhere('verification.expired_at > NOW()')
            .orderBy('verification.created_at', 'DESC')
            .take(1)
            .getOne();

        return extantOtpToken;
    }

    async getByOtpToken(otpToken: string): Promise<PhoneVerification> {
        const extantOtpToken = await this.createQueryBuilder('verification')
            .where('verification.otp_token = :otpToken', { otpToken })
            .andWhere('verification.expired_at > NOW()')
            .orderBy('verification.created_at', 'DESC')
            .take(1)
            .getOne();

        return extantOtpToken;
    }
}
