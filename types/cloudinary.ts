import { uploadOptions } from "./types";
import { multerFunctionParams } from "./multer";
import type { UploadApiOptions, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { v2 } from "cloudinary";

type cloudinaryUploadOptionsFn = (
    { req, file, cb }: multerFunctionParams,
    params: UploadApiOptions,
    options: uploadOptions | null
) => UploadApiOptions;

interface cloudinaryApiResponse {
    etag: string,
    filename: string,
    folder: string | null,
    height: number,
    width: number,
    path: string,
    signature: string,
    size: number,
    timeCreated: string,
    versionId: string
}

type cloudinaryApiResponseFn = (uploadResponse: UploadApiResponse) => cloudinaryApiResponse

export type {
    cloudinaryUploadOptionsFn,
    cloudinaryApiResponse,
    cloudinaryApiResponseFn,
    UploadApiResponse,
    UploadApiErrorResponse
}

export { v2 }