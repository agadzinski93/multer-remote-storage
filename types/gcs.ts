import { StorageOptions, Bucket, Storage, File } from "@google-cloud/storage";
import { multerFunctionParams } from "./multer";
import { uploadOptions } from './types'

interface gcsParams extends StorageOptions {
    bucket: string,
    chunkSize?: number
}

type gcsUploadOptionsFn = (
    { req, file, cb }: multerFunctionParams,
    params: gcsParams,
    options: uploadOptions
) => [object, string];

type gcsResponseFn = (
    uploadResponse: File,
    bucket: Bucket,
    destFileName: string
) => object;

export type {
    gcsParams,
    gcsUploadOptionsFn,
    gcsResponseFn
}

export { Storage }