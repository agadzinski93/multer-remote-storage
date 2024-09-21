import { Request } from "express"
import { File, MulterCallback } from "./multer.ts"
import { S3ClientConfig, Tag } from "@aws-sdk/client-s3"
import type { StorageOptions } from "@google-cloud/storage"
import type { s3Params } from "./s3.ts"
import { cloudinaryParams } from "./cloudinary.ts"
import { gcsParams } from "./gcs.ts"
import { ConfigOptions } from "cloudinary"

type options = {
    options?: uploadOptions
}

type CloudinaryTarget = options & {
    target: 'CLOUDINARY'
    config: boolean | ConfigOptions
    params?: cloudinaryParams
}

type AwsS3Target = options & {
    target: 'AWS_S3'
    config: S3ClientConfig,
    params: s3Params
}

type GcsTarget = options & {
    target: 'GCS'
    config: StorageOptions,
    params: gcsParams
}

type UploadTarget = CloudinaryTarget | AwsS3Target | GcsTarget;

interface uploadOptions {
    chunk_size?: number,
    leavePartsOnError?: boolean,
    public_id?: string | ((req: Request, file: File, cb: MulterCallback) => string),
    queueSize?: number,
    tags?: Tag[] | undefined,
    trash?: string,
    validator?: (req: Request, file: File, cb: MulterCallback) => boolean
}

export type {
    UploadTarget,
    uploadOptions
}