import { AbortController as IAbortController } from "@smithy/types";
import { uploadOptions } from './types.ts'
import { CompleteMultipartUploadCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { multerFunctionParams } from "./multer.ts";
import { Readable } from 'stream'
import { Options } from "@aws-sdk/lib-storage";

type s3UploadOptionsFn = (
    { req, file, cb }: multerFunctionParams,
    client: S3Client,
    params: {
        bucket: string,
        key: string,
        body: Readable,
        metadata?: Record<string, string>
    },
    options: uploadOptions
) => Options;

interface s3UploadOptions {
    client: S3Client,
    params: s3Params,
    tags?: string[],
    queueSize?: number,
    partSize?: number,
    leavePartsOnError?: boolean,
    totalBytes?: number,
    bytesUploadedSoFar?: number,
    abortController?: IAbortController;
}

interface s3Params {
    Bucket: string,
    Key?: string,
    Body: Readable,
    Metadata?: Record<string, string>,
    ContentType?: string
}

type s3ResponseFn = (uploadResponse: CompleteMultipartUploadCommandOutput, options: Options) => {
    bucket?: string,
    contentType: string | undefined,
    etag?: string,
    filename?: string,
    metadata: object | undefined,
    path?: string,
    encryption?: string,
    versionId?: string
}

type contentTypeFn = (filename: string) => string

export type {
    s3UploadOptionsFn,
    s3UploadOptions,
    Options,
    s3Params,
    s3ResponseFn,
    contentTypeFn
}