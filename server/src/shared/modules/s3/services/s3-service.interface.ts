export interface IS3Service {
    createPresignedUrl(bucket: string, key: string): Promise<string>;
    putObject(bucket: string, key: string, data: Buffer, contentType: string): Promise<void>;
    delObject(bucket: string, s3LocationUrl: string): Promise<void>;
}

export const IS3Service = Symbol('IS3Service');
