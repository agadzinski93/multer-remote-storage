import { uploadOptions } from "./types";
import { multerFunctionParams } from "./multer";
import type { UploadApiOptions, UploadApiResponse, UploadApiErrorResponse, ResourceType, DeliveryType } from "cloudinary";
import { v2 } from "cloudinary";

interface cloudinaryParams extends UploadApiOptions { }

type cloudinaryUploadOptionsFn = (
    { req, file, cb }: multerFunctionParams,
    params: cloudinaryParams,
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

interface cloudinaryDeleteOptions {
    resource_type: ResourceType,
    type: DeliveryType,
    invalidate: boolean
}

export type {
    cloudinaryParams,
    cloudinaryUploadOptionsFn,
    cloudinaryApiResponse,
    cloudinaryApiResponseFn,
    UploadApiResponse,
    UploadApiErrorResponse,
    cloudinaryDeleteOptions
}

export { v2 }