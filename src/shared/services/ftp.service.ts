import { Readable, Writable } from 'stream';
import { Injectable } from '@nestjs/common';
import * as ftp from 'basic-ftp';
import { FtpOptions } from '../interfaces';

@Injectable()
export class FtpService {
    async connectSession(client: ftp.Client, options: FtpOptions): Promise<ftp.Client> {
        if (!client) {
            client = new ftp.Client();
        }
        client.ftp.verbose = process.env.FTP_VERBOSE === 'true';
        await client.access({
            host: options.host,
            user: options.username,
            password: options.password,
            secure: options.isSecure,
            secureOptions: {
                rejectUnauthorized: false,
            },
        });

        return client;
    }

    async uploadFile(content: string, uploadPath: string, options: FtpOptions) {
        const client = new ftp.Client();
        try {
            await this.connectSession(client, options);
            await client.uploadFrom(Readable.from(content), uploadPath);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        } finally {
            client.close();
        }
    }

    async downloadFile(filePath: string, destination: Writable | string, options: FtpOptions) {
        const client = new ftp.Client();
        try {
            await this.connectSession(client, options);
            await client.downloadTo(destination, filePath);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        } finally {
            client.close();
        }
    }

    async renameFile(filePath: string, newFilePath: string, options: FtpOptions) {
        const client = new ftp.Client();
        try {
            await this.connectSession(client, options);
            await client.rename(filePath, newFilePath);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        } finally {
            client.close();
        }
    }

    async removeFile(filePath: string, options: FtpOptions) {
        const client = new ftp.Client();
        try {
            await this.connectSession(client, options);
            await client.remove(filePath);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        } finally {
            client.close();
        }
    }

    async listFiles(dirPath: string, options: FtpOptions) {
        const client = new ftp.Client();
        try {
            await this.connectSession(client, options);
            const files = await client.list(dirPath);
            return files.map(f => {
                return f.name;
            });
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        } finally {
            client.close();
        }
    }
}
