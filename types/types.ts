import { Request } from "express"
import { File, MulterCallback } from "./multer.ts"
import { Tag } from "@aws-sdk/client-s3"
import { S3Client } from './s3.ts'
import type { Storage } from "@google-cloud/storage"
import { v2 } from './cloudinary.ts'

interface uploadObject {
    client: S3Client | Storage | typeof v2,
    params?: any,
    options?: uploadOptions
}

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
    uploadObject,
    uploadOptions
}