import { Storage, File, CreateWriteStreamOptions } from "@google-cloud/storage";
import { multerFunctionParams } from "./multer";
import { uploadOptions } from './types'

interface gcsParams extends CreateWriteStreamOptions {
    bucket: string
}

type gcsUploadOptionsFn = (
    { req, file, cb }: multerFunctionParams,
    params: gcsParams,
    options: uploadOptions
) => [CreateWriteStreamOptions, string];

type gcsResponseFn = (
    uploadResponse: File,
    bucket: string,
    destFileName: string
) => object;

export type {
    gcsParams,
    gcsUploadOptionsFn,
    gcsResponseFn
}

export { Storage }