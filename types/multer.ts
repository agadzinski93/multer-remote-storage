import { Request } from 'express';
import { Readable } from 'stream';
import { ResponseCallback as CloudinaryResponseCallback } from 'cloudinary';
interface multerFunctionParams {
    req: Request,
    file: ProcessedMulterFile,
    cb: Function
}

interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    encryptionKey?: string,
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}

type ProcessedFile = ReadableStream<Uint8Array>;

interface ProcessedMulterFile extends File {
    stream: Readable
}

type handleFileFn = (
    req: Request,
    file: ProcessedMulterFile,
    cb: CloudinaryResponseCallback
) => void;

type uploadFn = (
    req: Request,
    file: ProcessedMulterFile,
    cb: Function
) => Promise<object> | undefined;

export type {
    multerFunctionParams,
    File,
    ProcessedFile,
    ProcessedMulterFile,
    handleFileFn,
    uploadFn
}