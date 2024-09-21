import { Request } from "express"
import { File, MulterCallback } from "./multer.ts"
import { S3ClientConfig } from "@aws-sdk/client-s3"
import { Options } from "@aws-sdk/lib-storage";
import type { StorageOptions } from "@google-cloud/storage"
import type { s3Params } from "./s3.ts"
import { cloudinaryParams } from "./cloudinary.ts"
import { gcsParams } from "./gcs.ts"
import { ConfigOptions } from "cloudinary"

type options = {
    options?: uploadOptions
}

type s3Options = {
    options?: s3UploadOptions
}

type CloudinaryTarget = options & {
    target: 'CLOUDINARY'
    config: boolean | ConfigOptions
    params?: cloudinaryParams
}

type GcsTarget = options & {
    target: 'GCS'
    config: StorageOptions,
    params: gcsParams
}

type AwsS3Target = s3Options & {
    target: 'AWS_S3'
    config: S3ClientConfig,
    params: s3Params
}

type UploadTarget = CloudinaryTarget | AwsS3Target | GcsTarget;

interface uploadOptions {
    chunk_size?: number,
    public_id?: string | ((req: Request, file: File, cb: MulterCallback) => string),
    trash?: string,
    validator?: (req: Request, file: File, cb: MulterCallback) => boolean
}

type s3UploadOptions = uploadOptions & Omit<Options, 'client' | 'params'>

export type {
    UploadTarget,
    uploadOptions,
    s3UploadOptions
}