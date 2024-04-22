import { uploadOptions } from "./types";
import { multerFunctionParams } from "./multer";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";

interface cloudinaryParams {
    file: string,
    chunk_size?: number,
    upload_preset?: string,
    signature?: string,
    public_id?: string,
    public_id_prefix?: string,
    display_name?: string,
    asset_filder?: string,
    use_asset_folder_as_public_id_prefix?: boolean,
    folder?: string,
    use_filename?: boolean,
    use_filename_as_display_name?: boolean,
    unique_filename?: boolean,
    filename_override?: string,
    resource_type?: string,
    type?: string,
    access_control?: JSON,
    access_mode?: string,
    discard_original_filename?: boolean,
    overwrite?: boolean,
    tags?: string | string[],
    context?: string,
    metadata?: string,
    clear_invalid?: boolean,
    colors?: boolean,
    faces?: boolean,
    quality_analysis?: boolean,
    accessibility_analysis?: boolean,
    cinemagraph_analysis?: boolean,
    image_metadata?: boolean,
    media_metadata?: boolean,
    phash?: boolean,
    responsive_breakpoints?: JSON,
    auto_tagging?: number,
    categorization?: string,
    detection?: string,
    ocr?: string,
    visual_search?: boolean,
    exif?: boolean,
    eager?: string,
    eager_async?: boolean,
    eager_notification_url?: string,
    transformation?: string,
    format?: string,
    custom_coordinates?: string,
    regions?: JSON,
    face_coordinates?: string,
    background_removal?: string,
    raw_convert?: string,
    allowed_formats?: string | string[],
    async?: boolean,
    backup?: boolean,
    callback?: string,
    eval?: Function,
    on_success?: Function,
    headers?: string,
    invalidate?: boolean,
    notification_url?: string,
    proxy?: string,
    return_delete_token?: boolean,
    timeout?: number
}

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
    cloudinaryParams,
    cloudinaryUploadOptionsFn,
    cloudinaryApiResponse,
    cloudinaryApiResponseFn,
    UploadApiResponse
}