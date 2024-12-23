import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { AppConfigService } from '@shared/config';
import { AttachmentType } from '@shared/enums';
import { generatePublicId } from '@shared/utils';

@Injectable()
export class FileService {
    constructor(private readonly configService: AppConfigService) {
        this.configService = configService;
        AWS.config.update(this.configService.awsCredentials);
    }

    async getSignedUrl(attachmentType: string, name: string, referenceId?: string, action = 'putObject'): Promise<{ url: string; key: string }> {
        this.validateAttachmentType(attachmentType);

        const { s3Bucket, expiresIn } = this.configService.assetOptions;
        const s3 = new AWS.S3({
            signatureVersion: 'v4',
            s3ForcePathStyle: true,
        });
        const { key, acl } = this.getAssetMetadata(attachmentType, referenceId, name);
        const s3Params = {
            Bucket: s3Bucket,
            Key: key,
            Expires: expiresIn,
            ACL: 'private',
        };
        if (acl) {
            s3Params.ACL = acl;
        }
        const url = await s3.getSignedUrlPromise(action, s3Params);
        return { url, key: `${this.configService.assetOptions.cdnUrl}${key}` };
    }

    getAssetMetadata(attachmentType: string, referenceId: string, fileName: string) {
        switch (attachmentType.toUpperCase()) {
            case AttachmentType.Avatar:
                if (!referenceId) {
                    referenceId = `${Date.now().toString()}${generatePublicId()}`;
                }
                return { key: `${attachmentType.toLowerCase()}s/${referenceId}.${fileName.split('.').pop()}`, acl: 'public-read' };
            default:
                return {
                    key: `${attachmentType.toLowerCase()}s/${[referenceId, Date.now().toString(), fileName].filter(Boolean).join('_')}`,
                    acl: [
                        AttachmentType.Document.toUpperCase(),
                        AttachmentType.EquipmentPhoto.toUpperCase(),
                        AttachmentType.TechnicalReport.toUpperCase(),
                        AttachmentType.CompetitorEquipment.toUpperCase(),
                        AttachmentType.Icon.toUpperCase(),
                    ].includes(attachmentType.toUpperCase())
                        ? 'public-read'
                        : null,
                };
        }
    }

    validateAttachmentType(attachmentType: string) {
        Logger.log(attachmentType);
        const regex = new RegExp(Object.values(AttachmentType).join('|'), 'i');
        if (!regex.test(attachmentType)) {
            throw new BadRequestException();
        }
    }

    async writeToPayoutsBucket(path, content) {
        const s3 = new AWS.S3();
        const params = {
            Bucket: this.configService.assetOptions.s3BucketPayouts,
            Key: path,
            ACL: 'public-read',
            Body: content,
            ContentType: 'text/csv',
        };

        return s3.upload(params).promise();
    }
}
