import { Request } from "express"
import { File } from "./multer.ts"
import { Tag } from "@aws-sdk/client-s3"

interface uploadOptions {
    chunk_size?: number,
    leavePartsOnError?: boolean,
    public_id?: string | ((req: Request, file: File, cb: Function) => string),
    queueSize?: number,
    tags?: Tag[] | undefined,
    validator?: (req: Request, file: File, cb: Function) => string
}

/* 
interface ProcessedFile {
    filedname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    bucket?: string,
    contentType?: string,
    encryption?: string,
    etag: string,
    filename: string,
    height?: number,
    width?: number,
    metadata: object | undefined,
    path: string,
    signature?: string,
    size?: number,
    storageClass: string,
    timeCreated?: string,
    versionId?: string | undefined
} */

export type {
    uploadOptions
}