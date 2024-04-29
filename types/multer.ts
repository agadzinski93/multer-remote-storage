import { Request } from 'express';
import { Readable } from 'stream';

type MulterCallback = (error?: any, info?: Partial<Express.Multer.File>) => void;
type ErrorCallback = (error: Error | null) => void;

interface multerFunctionParams {
    req: Request,
    file: Express.Multer.File,
    cb: MulterCallback
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
    file: Express.Multer.File,
    cb: MulterCallback
) => void;

type removeFileFn = (re: Request, file: Express.Multer.File, cb: ErrorCallback) => void;

type uploadFn = (
    req: Request,
    file: Express.Multer.File,
    cb: MulterCallback
) => Promise<object> | undefined;

export type {
    MulterCallback,
    ErrorCallback,
    multerFunctionParams,
    File,
    ProcessedFile,
    ProcessedMulterFile,
    handleFileFn,
    removeFileFn,
    uploadFn
}