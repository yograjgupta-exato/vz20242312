import { createCipheriv, createDecipheriv, createHash, pseudoRandomBytes } from 'crypto';
import * as _ from 'lodash';
import { DateTime } from 'luxon';
import { DigitalSignatureType } from '@shared/enums/digital-signature-type';
import { TRANSACTION_DATE_FORMAT, MALAYSIA_TIMEZONE } from './ipay88.constant';

export function propertyToString(obj: any): any {
    return _.mapValues(obj, _.toString);
}

export function signatureSha256(source: string): string {
    return createHash('sha256')
        .update(source)
        .digest('hex');
}

export function signatureSha1(source: string): string {
    return createHash('sha1')
        .update(source)
        .digest('base64');
}

export function getSignature(input: object, type: DigitalSignatureType = DigitalSignatureType.SHA256): string {
    const strSignature = _.join(_.map(_.reject(_.values(input), _.isNil), _.toString), '');
    return type === DigitalSignatureType.SHA256 ? signatureSha256(strSignature) : signatureSha1(strSignature);
}

export function stripAmountString(amount: string): string {
    return _.isString(amount) ? amount.replace(/[.,]/g, '') : '';
}

export function parseTransactionDate(date: number | string): Date {
    return date ? DateTime.fromFormat(date.toString(), TRANSACTION_DATE_FORMAT, { zone: MALAYSIA_TIMEZONE }).toJSDate() : null;
}

export function aesEncrypt(key: string, msg: string): { iv: string; encrypted: string } {
    const algorithm = 'aes-128-cbc';
    const cipherIvSize = 16;
    const iv = pseudoRandomBytes(cipherIvSize);
    const ivText = iv.toString('base64');
    const keyBuf = Buffer.from(key, 'base64');

    const cipher = createCipheriv(algorithm, keyBuf, iv);
    let encrypted = cipher.update(msg, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return {
        iv: ivText,
        encrypted,
    };
}

export function aesDecrypt(key: string, iv: string, encrypted: string): string {
    const algorithm = 'aes-128-cbc';
    const ivBuf = Buffer.from(iv, 'base64');
    const keyBuf = Buffer.from(key, 'base64');

    const decipher = createDecipheriv(algorithm, keyBuf, ivBuf);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
