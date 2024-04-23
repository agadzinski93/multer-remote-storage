# multer-remote-storage
Use Multer to easily upload files to Cloudinary, AWS S3, or Google Cloud Storage

* Easily switch between storage targets
* Use your own validator function to prevent file uploads in the event other HTTP request body data does not pass validation
* Add a chunk_size to the options to automatically trigger a chunked upload for your file

## Contents
1. [Setup](#Setup)
2. [Examples](#Examples)
    * [Cloudinary Example](#Cloudinary-Example)
    * [Google Cloud Storage Example](#Google-Cloud-Storage-Example)
    * [AWS S3 Example](#AWS-S3-Example)
3. [Options](#Options)
4. [Validation](#Validation)
    * [Big Note on Validator](#Big-Note-on-Validator)
5. [Public Id](#Public-Id)

## Setup
Run this command to install:
```bash 
npm install multer-remote-storage
```
## Examples

### Cloudinary Example
```javascript
import {v2 as Cloudinary} from 'cloudinary';
import { RemoteStorage } from 'multer-remote-storage';

Cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET,
    secure:true,
});

const storage = new RemoteStorage({
    client:Cloudinary,
    params: {
        folder:'Myfolder'
    }
});

export {storage}
```
| Property | Value |
|-------------|--------------|
| client       | [Cloudinary namespace](https://cloudinary.com/documentation/node_quickstart#configure_cloudinary) |
| params?       | Same as Cloudinary's [upload_stream](https://cloudinary.com/documentation/image_upload_api_reference#upload) and [upload_chunked_stream](https://cloudinary.com/documentation/upload_images#chunked_asset_upload) |
|options?      |[See Below](#Options)  |

The following data will be appended to req.file

|variable|data type|info|
|---|---|---|
|etag|string|
|filename|string|includes folder, excludes extension
|folder|string|
|height|number|if applicable
|width|number|if applicable
|path|string|public URL
|signature|string|
|size|number|
|timeCreated|string|
|versionId|string|

### Google Cloud Storage Example
```javascript
import {join,dirname} from 'path';
import { Storage as Gcs } from '@google-cloud/storage';
import { RemoteStorage } from 'multer-remote-storage';

const __filename = fileURLToPath(import.meta.url);

const gcsStorage = new RemoteStorage({
    client:new Gcs({
        keyFilename: join(dirname(__filename),'pathToKey.json'),
        projectId: 'your-google-storage-projectId',
    }),
    params:{
        bucket:'mybucket'
    }
});
```
| Property | Value |
|-------------|--------------|
| client       | [Google Cloud's Storage Class](https://www.npmjs.com/package/@google-cloud/storage)  |
| params?       | Name of bucket PLUS [options](https://cloud.google.com/storage/docs/uploading-objects#storage-upload-object-client-libraries) for uploading object to bucket  |
|options?      |[See Below](#Options)|

The following data will be appended to req.file

|variable|data type|info|
|---|---|---|
|bucket|string|
|contentType|string|
|etag|string|
|filename|string|
|path|string|public URL
|size|number|
|storageClass|string|
|timeCreated|string|

### AWS S3 Example
```javascript
import { S3Client } from '@aws-sdk/client-s3';
import { RemoteStorage } from 'multer-remote-storage';

const s3Storage = new RemoteStorage({
    client: new S3Client({
        credentials: {
            accessKeyId:process.env.S3_ACCESS_KEY,
            secretAccessKey:process.env.S3_SECRET_KEY
        },
        region:process.env.S3_REGION,
    }),
    params: {
        bucket:'mybucket'
    }
});
```
| Property | Value |
|-------------|--------------|
| client       | [S3Client Class](https://www.npmjs.com/package/@aws-sdk/client-s3)  |
| params?       | Options for [Upload](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-storage/) class  |
|options?      |[See Below](#Options) |

The following data will be appended to req.file

|variable|data type|info|
|---|---|---|
|bucket|string|
|contentType|string|
|etag|string|
|filename|string|
|metadata|object|metadata passed in Upload options
|path|string|public URL
|encryption|string|
|versionId|string|undefined if versioning disabled

### Options

All options are optional. Some may only apply to certain clients. See below.

| Options |Data Type | Description |
|--------|--------|-----|
chunk_size| number | This will trigger a chunked upload for any client
public_id | string or (req,file,cb) => string | String or function that returns a string that will be used as the filename
trash|string|Alternative text for trash text. [See Validation](#Validation)
validator|(req,file,cb) => boolean| [See Validation](#Validation)
leavePartsOnError| boolean| S3 Only
queueSize| number | S3 Only
tags | Tags[] | S3 Only

### Validation
Sometimes when uploading a file, it will be part of a form with other data that will exist on req.body. What if you need to validate that other form data before proceeding to upload the file? That's where this function comes in! 

Here is an example:
```javascript
/**
 * You will have access to Express's req.body
 * 
 * You can validate anything you wish and return true/false
 * on whether you want the file to upload (true = upload)
 * 
 * True or false will still cause the code to continue to the next 
 * middleware in your route. Calling cb(err) will result in Multer
 * calling next(err) in your app.
 * 
 * This example manually calls JOI's (a validation library for NodeJS)
 * validation function to validate the fields on req.body
 * 
 * In this example, you'll still need to call JOI's validator as a
 * middleware in your route AFTER multer to actually give the client
 * a response with error details
 * 
 * You can create a more complex function that checks on which
 * URL the client is visiting to decide which validator to use.
 * This prevents you from having to create another RemoteStorage
 * object for each type of validator
 */
const handleTopicValidation = (req, file, cb) => {
    let output = true;
        try {
            const {error, value} = topicValidator.validate(req.body);
            if (error) output = false;
        } catch(err) {
            output = false;
        }
        return output;
}

const topicStorage = new RemoteStorage({
    client:Cloudinary,
    params: {
        folder:'myfolder'
    },
    options: {
        chunk_size:1024 * 256 * 5,
        validator: handleTopicValidation
    },
});
```
#### Big Note on Validator
If you pass false, thus bypassing file upload, the software still has to pipe the readable stream somewhere. As a solution, it will use `fs`'s `createWriteStream` function to create a file to dump the data in. Immediately afterwards, it will call `fs`'s `rm` function to delete that file.

Two notes:
1. Make sure your Node app has writing privileges in its own directory. Otherwise, you might get an `Access Denied` error.
2. The default filename created is called `trash.txt`. You can use the `trash` option to customize the filename so it doesn't mess with any file you may have.

### Public Id
The `public_id` option allows you to define a string, or a function that returns a string, to deal with naming the file you upload. Using this property may overwrite any similar function in the `params` object for the client you are using.

NOTE: Cloudinary does NOT want the file extension in the filename whereas Google Cloud Storage and AWS S3 do.

```javascript
const handlePublicId = (req,file,cb) => {
    return `${file.originalname.split('.')[0]}-${Date.now()}.${file.originalname.split('.')[1]}`
}

const s3Storage = new RemoteStorage({
    client: new S3Client({
        credentials: {
            accessKeyId:process.env.S3_ACCESS_KEY,
            secretAccessKey:process.env.S3_SECRET_KEY
        },
        region:process.env.S3_REGION,
    }),
    params: {
        bucket:'mybucket'
    },
    options: {
        chunk_size: 1024 * 1000 * 10,
        public_id: handlePublicId
    }
});
```