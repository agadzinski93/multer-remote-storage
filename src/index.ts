import { createWriteStream, rm } from 'fs';
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { handleFileFn, removeFileFn, uploadFn } from '../types/multer.ts';

import { uploadObject } from '../types/types.ts';

import {
    cloudinaryUploadOptionsFn,
    cloudinaryApiResponseFn,
    v2
} from '../types/cloudinary.ts';

import {
    gcsUploadOptionsFn,
    gcsResponseFn,
    gcsParams,
    Storage
} from '../types/gcs.ts';

import {
    s3UploadOptionsFn,
    s3ResponseFn,
    Options,
    contentTypeFn
} from '../types/s3.ts';

const CLOUDINARY = 'Cloudinary';
const GOOGLE_CLOUD_SERVICES = 'Storage';
const AWS_S3 = 'S3Client';
const MICROSOFT_AZURE_BLOBS = 'blobs';

const generateCloudinaryUploadOptions: cloudinaryUploadOptionsFn = ({ req, file, cb }, params, options) => {
    let output = {
        ...params
    };
    if (options) {
        if (options.chunk_size) output.chunk_size = options.chunk_size
        if (options.public_id) {
            if (typeof options.public_id === 'string') output.public_id = options.public_id
            else if (typeof options.public_id === 'function') output.public_id = options.public_id(req, file, cb)
        }
    }
    return output;
}

const generateCloudinaryResponse: cloudinaryApiResponseFn = (uploadResponse) => {
    return {
        etag: uploadResponse.etag,
        filename: uploadResponse.public_id,
        folder: uploadResponse.folder || null,
        height: uploadResponse.height,
        width: uploadResponse.width,
        path: uploadResponse.secure_url,
        signature: uploadResponse.signature,
        size: uploadResponse.bytes,
        timeCreated: uploadResponse.created_at,
        versionId: uploadResponse.version_id
    }
}

const generateGcsUploadOptions: gcsUploadOptionsFn = ({ req, file, cb }, params, options) => {
    let output: [gcsParams, string] = [{
        ...params
    }, ''];
    if (options) {
        if (options.chunk_size) output[0].chunkSize = options.chunk_size
        if (options.public_id) {
            if (typeof options.public_id === 'string') output[1] = options.public_id
            else if (typeof options.public_id === 'function') output[1] = options.public_id(req, file, cb)
        }
    }
    if (!output[1]) output[1] = file.originalname;
    return output;
}
const generateGcsResponse: gcsResponseFn = (uploadResponse, bucket, destFileName) => {
    return {
        bucket: uploadResponse?.metadata?.bucket,
        contentType: uploadResponse?.metadata?.contentType,
        etag: uploadResponse?.metadata?.etag,
        filename: destFileName,
        path: `https://storage.googleapis.com/${bucket}/${destFileName}`,
        size: (uploadResponse?.metadata?.size && typeof uploadResponse.metadata.size === 'string') ? parseInt(uploadResponse.metadata.size) : undefined,
        storageClass: uploadResponse?.metadata?.storageClass,
        timeCreated: uploadResponse?.metadata?.timeCreated
    }
}

const generateS3UploadOptions: s3UploadOptionsFn = ({ req, file, cb }, client, params, options) => {
    let output: Options = {
        client,
        params: {
            Bucket: params.bucket,
            Body: file.stream,
            ContentType: determineContentTypeForS3(file.originalname),
            Key: params.key
        }
    }
    if (params.metadata) output.params.Metadata = params.metadata;
    if (options) {
        if (options.tags) output.tags = options.tags;
        if (options.queueSize) output.queueSize = options.queueSize;
        if (options.chunk_size) output.partSize = options.chunk_size;
        if (options.leavePartsOnError) output.leavePartsOnError = options.leavePartsOnError;
        if (options.public_id) {
            if (typeof options.public_id === 'string') output.params.Key = options.public_id
            else if (typeof options.public_id === 'function') output.params.Key = options.public_id(req, file, cb)
        }
    }
    if (!output.params.Key) output.params.Key = file.originalname;
    return output;
}

const generateS3Response: s3ResponseFn = (uploadResponse, options) => {
    return {
        bucket: uploadResponse.Bucket,
        contentType: options.params.ContentType,
        etag: uploadResponse.ETag,
        filename: uploadResponse.Key,
        metadata: options.params.Metadata,
        path: uploadResponse.Location,
        encryption: uploadResponse.ServerSideEncryption,
        versionId: uploadResponse.VersionId
    }
}

const determineContentTypeForS3: contentTypeFn = (filename) => {
    const ext = filename.split('.').pop();
    let contentType = 'application/octet-stream'
    if (ext === 'txt') contentType = 'text/plain'
    else if (ext === 'css' || ext === 'csv' || ext === 'html') contentType = `text/${ext}`
    else if (ext === 'htm') contentType = 'text/html'
    else if (ext === 'ics') contentType = 'text/calendar'
    else if (ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'apng' || ext === 'avif' || ext === 'bmp' || ext === 'tiff' || ext === 'webp') contentType = `image/${ext}`
    else if (ext === 'jpg') contentType = 'image/jpeg'
    else if (ext === 'ico') contentType = 'image/vnd.microsoft.icon'
    else if (ext === 'tif') contentType = 'image/tiff'
    else if (ext === 'svg') contentType = 'image/svg+xml'
    else if (ext === 'json' || ext === 'pdf' || ext === 'rtf' || ext === 'zip') contentType = `application/${ext}`
    else if (ext === 'js' || ext === 'mjs') contentType = 'text/javascript'
    else if (ext === 'avi') contentType = 'video/x-msvideo'
    else if (ext === 'mp4' || ext === 'mpeg' || ext === 'webm') contentType = `video/${ext}`
    else if (ext === 'ts') contentType = 'video/mp2t'
    else if (ext === 'aac' || ext === 'midi' || ext === 'opus' || ext === 'wav') contentType = `audio/${ext}`
    else if (ext === 'mp3') contentType = 'audio/mpeg'
    else if (ext === 'rar') contentType = 'application/vnd.rar'
    else if (ext === 'ppt') contentType = 'vnd.ms-powerpoint'
    else if (ext === 'php') contentType = 'application/x-httpd-php'
    else if (ext === 'jar') contentType = 'application/java-archive'
    else if (ext === 'gz') contentType = 'application/gzip'
    else if (ext === 'doc') contentType = 'application/msword'
    else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    return contentType;
}

export class RemoteStorage {
    #client;
    #host;
    #params;
    #options;
    #validator;
    #trash;

    constructor(opts: uploadObject) {
        this.#client = opts.client;
        this.#host = this.#client.constructor.name;
        this.#params = opts.params || {};
        this.#options = opts.options || {};
        this.#validator = (typeof this.#options.validator === 'function') ? this.#options.validator : null;
        this.#trash = this.#options.trash || 'trash.txt';

        if (this.#host !== GOOGLE_CLOUD_SERVICES &&
            this.#host !== AWS_S3 &&
            this.#host !== MICROSOFT_AZURE_BLOBS) {
            if (Object.keys(this.#client).includes('config') && Object.keys(this.#client).includes('uploader')) {
                this.#host = CLOUDINARY;
            } else {
                throw new Error(`Must define a client of class type ${GOOGLE_CLOUD_SERVICES}, ${AWS_S3}, ${MICROSOFT_AZURE_BLOBS} or of Cloudinary's v2 namespace`);
            }
        }
    }

    _handleFile: handleFileFn = async (req, file, cb) => {
        try {
            let validateSuccess = true;
            if (this.#validator) {
                validateSuccess = this.#validator(req, file, cb);
            }

            if (validateSuccess) {
                let res = null;

                switch (this.#host) {
                    case CLOUDINARY:
                        res = await this.#upload(req, file, cb);
                        cb(null, res);
                        break;
                    case GOOGLE_CLOUD_SERVICES:
                        res = await this.#upload(req, file, cb);
                        cb(null, res);
                        break;
                    case AWS_S3:
                        res = await this.#upload(req, file, cb);
                        cb(null, res);
                        break;
                    case MICROSOFT_AZURE_BLOBS:
                        break;
                    default:
                }
            } else {
                const writeStream = createWriteStream(this.#trash);
                await file.stream.pipe(writeStream)
                rm(this.#trash, (err) => { });
                cb(null, {
                    path: undefined,
                    size: 0,
                    filename: '/'
                });
            }
        } catch (err: any) {
            cb(err);
        }
    };

    _removeFile: removeFileFn = (req, file, cb) => {
        switch (this.#host) {
            case CLOUDINARY:
                (this.#client as typeof v2).uploader.destroy(
                    file.filename,
                    { invalidate: true },
                    cb
                );
                break;
            case GOOGLE_CLOUD_SERVICES:
                (this.#client as Storage).bucket(this.#params.bucket).file(file.filename).delete({ ignoreNotFound: true }, cb);
                break;
            case AWS_S3:
                (this.#client as S3Client).send(new DeleteObjectCommand({
                    Bucket: this.#params.bucket,
                    Key: file.filename
                }), cb);
                break;
            default:
        }
    };

    #upload: uploadFn = (req, file, cb) => {
        switch (this.#host) {
            case CLOUDINARY:
                return new Promise((resolve, reject) => {
                    let dataStream = null;
                    if (this.#options.chunk_size) {
                        dataStream = (this.#client as typeof v2).uploader.upload_chunked_stream(
                            generateCloudinaryUploadOptions({ req, file, cb }, this.#params, this.#options),
                            (err, uploadResponse) => {
                                if (err) reject(err);
                                if (uploadResponse) resolve(generateCloudinaryResponse(uploadResponse));
                            }
                        );
                    }
                    else {
                        dataStream = (this.#client as typeof v2).uploader.upload_stream(
                            generateCloudinaryUploadOptions({ req, file, cb }, this.#params, this.#options),
                            (err, uploadResponse) => {
                                if (err) reject(err);
                                if (uploadResponse) resolve(generateCloudinaryResponse(uploadResponse));
                            }
                        );
                    }
                    file.stream.pipe(dataStream);
                });
            case GOOGLE_CLOUD_SERVICES:
                return new Promise((resolve, reject) => {
                    const output: [object, string] = generateGcsUploadOptions({ req, file, cb }, this.#params, this.#options)
                    const [gcsUploadOptions, destFileName] = output;

                    const bucket = (this.#client as Storage).bucket(this.#params.bucket);
                    const destFile = bucket.file(destFileName);
                    if (this.#options.chunk_size) {
                        file.stream.pipe(destFile.createWriteStream(gcsUploadOptions)
                        ).on("error", (err: Error) => {
                            destFile.delete({ ignoreNotFound: true });
                            reject(err.message);
                        }).on("finish", () => {
                            resolve(generateGcsResponse(destFile, this.#params.bucket, destFileName))
                        });
                    }
                    else {
                        file.stream.pipe(destFile.createWriteStream(gcsUploadOptions)
                        ).on("error", (err: Error) => {
                            destFile.delete({ ignoreNotFound: true });
                            reject(err.message);
                        }).on("finish", () => {
                            resolve(generateGcsResponse(destFile, this.#params.bucket, destFileName))
                        });
                    }

                });
            case AWS_S3:
                return new Promise((resolve, reject) => {
                    const s3Options = generateS3UploadOptions({ req, file, cb }, (this.#client as S3Client), this.#params, this.#options);
                    const upload = new Upload(s3Options);
                    try {
                        upload.done()
                            .then((response) => {
                                resolve(generateS3Response(response, s3Options));
                            })
                            .catch((err) => {
                                reject(err)
                            });
                    } catch (err) {
                        reject(err);
                    }
                });
            case MICROSOFT_AZURE_BLOBS:
                break;
            default:
        }
    }
}

export * from '../types/cloudinary.ts';
export * from '../types/gcs.ts';
export * from '../types/multer.ts';
export * from '../types/s3.ts';
export * from '../types/types.ts';