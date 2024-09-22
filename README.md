# multer-remote-storage
Use Multer to easily upload files to Cloudinary, AWS S3, or Google Cloud Storage

* Easily switch between storage targets
* Use your own validator function to prevent file uploads in the event other data on `req.body` does not pass validation
* Add a chunk_size to the options to automatically trigger a chunked upload for your file
* (new) You can now delete files from any client by calling the `delete(filename, [options])` function
* (new) Dynamic typing support to assist with available properties when configuring for Cloudinary, AWS S3, or Google Cloud Storage

## Contents
1. [Setup](#Setup)
2. [Configuration](#Configuration)
    * [Cloudinary Configuration](#Cloudinary-Configuration)
    * [Google Cloud Storage Configuration](#Google-Cloud-Storage-Configuration)
    * [AWS S3 Configuration](#AWS-S3-Configuration)
3. [Upload Files](#Upload-Files)
    * [Cloudinary Upload](#Cloudinary-Upload)
    * [Google Cloud Storage Upload](#Google-Cloud-Storage-Upload)
    * [AWS S3 Upload](#AWS-S3-Upload)
4. [Delete Files](#Delete-Files)
    * [Cloudinary Delete Options](#Cloudinary-Delete-Options)
    * [Google Cloud Storage Delete Options](#Google-Cloud-Storage-Delete-Options)
    * [AWS S3 Delete Options](#AWS-S3-Delete-Options)
5. [Options](#Options)
6. [Validation](#Validation)
    * [Big Note on Validator](#Big-Note-on-Validator)
7. [Public Id](#Public-Id)
8. [TypeScript Example](#TypeScript-Example)
9. [Release Notes](#Release-Notes)
    * [Changes](#Changes)
    * [Errors](#Errors)
        * [Object literal may only specify known properties but bucket does not exist in type s3Params](#Object-literal-may-only-specify-known-properties-but-bucket-does-not-exist-in-type-s3Params)

## Setup
Run this command to install:
```bash 
npm install multer-remote-storage
```

## Configuration

The `RemoteStorage` class supports dynamic typing. You'll see below in each example that the `target` property will affect the types for the `config`, `params`, and `options` properties.

### Cloudinary Configuration

```javascript
import { RemoteStorage } from 'multer-remote-storage';

const storage = new RemoteStorage({
    target: 'CLOUDINARY',
    config: {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
        secure:true,
    },
    params: {
        folder: 'MyFolder'
    }
});

export { storage }
```

| Property | Value |
|-------------|--------------|
| target | Must be `CLOUDINARY`
| config       | [Cloudinary's config params](https://cloudinary.com/documentation/cloudinary_sdks#configuration_parameters) |
| params?       | Same as Cloudinary's [upload_stream](https://cloudinary.com/documentation/image_upload_api_reference#upload) and [upload_chunked_stream](https://cloudinary.com/documentation/upload_images#chunked_asset_upload) |
|options?      |[See Below](#Options)  |

### Google Cloud Storage Configuration

```javascript
import {join,dirname} from 'path';
import { RemoteStorage } from 'multer-remote-storage';

const __filename = fileURLToPath(import.meta.url);

const gcsStorage = new RemoteStorage({
    target: 'GCS',
    config: {
        keyFilename: join(dirname(__filename), 'relativePathToKey.json'),
        projectId: 'your-google-storage-projectId'
    },
    params: {
        bucket: 'mybucket'
    }
});

export { gcsStorage }
```

| Property | Value |
|-------------|--------------|
| target | Must be `GCS`
| config       | Google Cloud's Storage Class's [StorageOptions](https://googleapis.dev/nodejs/storage/latest/global.html#StorageOptions)  |
| params       | bucket (required) PLUS options from [CreateWriteStreamOptions](https://cloud.google.com/nodejs/docs/reference/storage/latest/storage/createwritestreamoptions) for uploading object to bucket  |
|options?      |[See Below](#Options)|

### AWS S3 Configuration

```javascript
import { RemoteStorage } from 'multer-remote-storage';

const s3Storage = new RemoteStorage({
    target: 'AWS_S3',
    config: {
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        },
        region: process.env.S3_REGION
    },
    params: {
        Bucket: 'mybucket' //Notice parameters are capitalized for AWS
    }
});

export { s3Storage }
```

| Property | Value |
|-------------|--------------|
| target | Must be `AWS_S3`
| config       | S3Client Class's [S3ClientConfig's](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/Interface/S3ClientConfig/) Options. You'll need to click on `S3ClientConfigType` then click on the sub-types to see all available properties  |
| params       | Bucket (required) PLUS options for [Upload](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-storage/) class's `params` property. `Key` will be populated with your `public_id` function if you provide one in `options` below. If both are omitted, the file's original name will be used |
|options?      |[See Below](#Options) |

## Upload Files

### Cloudinary Upload

```javascript
import multer from 'multer';
import { storage } from '../utilities/storage.js'; //Your RemoteStorage instance
import { filter } from '../utilities/validators/fileValidator.js'; //Multer-related

const router = express.Router({ caseSensitive: false, strict: false });

const parser = multer({storage, fileFilter:filter, limits:{fileSize:1024000}});

router.route('/:username/create')
  .post(isLoggedIn,isAuthor,parser.single('topic[file]'),createTopic)
```

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

### Google Cloud Storage Upload

```javascript
import multer from 'multer';
import { gcsStorage } from '../utilities/storage.js'; //Your RemoteStorage instance
import {filter} from '../utilities/validators/fileValidator.js'; //Multer-related

const router = express.Router({ caseSensitive: false, strict: false });

const gcsParser = multer({ storage:gcsStorage, fileFilter:filter, limits:{ fileSize:1024000 }});

router.route('/:username/create')
  .post(isLoggedIn,isAuthor,gcsParser.single('topic[file]'),createTopic)
```

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

### AWS S3 Upload

```javascript
import multer from 'multer';
import { s3Storage } from '../utilities/storage.js'; //Your RemoteStorage instance
import {filter} from '../utilities/validators/fileValidator.js'; //Multer-related

const router = express.Router({ caseSensitive: false, strict: false });

const s3Parser = multer({storage:s3Storage, fileFilter:filter, limits:{fileSize:1024000}});

router.route('/:username/create')
  .post(isLoggedIn,isAuthor,s3Parser.single('topic[file]'),createTopic)
```

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

## Delete Files

You can delete files from any client by simply calling the `delete` function that will be attached to your `RemoteStorage` instance like this: `storage.delete(filename, [options])`. The `filename` is the same as the `filename` property that was populated on `req.file` during upload. The `options` will be dependent on which storage service you're using.

```javascript
import { storage } from "../../config/storage"; //Your RemoteStorage instance

storage.delete(filename, options); //Options are optional
```

### Cloudinary Delete Options

Delete options are optional.

The available options are the same as Cloudinary's `destroy` function. [Click here](https://cloudinary.com/documentation/deleting_assets_tutorial#delete_one_asset_at_a_time) for details.

| Options |Data Type |
|--------|--------|
resource_type| ResourceType 
type | DeliveryType
invalidate | boolean

### Google Cloud Storage Delete Options

Delete options are optional.

[Click here](https://cloud.google.com/storage/docs/deleting-objects) for details.

### AWS S3 Delete Options

Delete options are optional.

Omit<[DeleteObjectCommandInput](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/Interface/DeleteObjectCommandInput/), 'Bucket' | 'Key'>

**Note:** The `RemoteStorage` class will handle populating `Bucket`. The `Key` property will be populated based on the `filename` you passed in. That's why they're omitted.

## Options

All options are optional.

For AWS S3 users, additional properties will be accessible from S3's [Upload's Options](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-storage/) properties (e.g. `tags`, `queueSize`, `leavePartsOnError`, etc) excluding `client` and `params` via `Omit<Options, 'client' | 'params'>`. The `partSize` property will be populated automatically if you fill the `chunk_size` property. Either will work.

| Options |Data Type | Description |
|--------|--------|-----|
chunk_size| number | This will trigger a chunked upload for any client
public_id | string or (req,file,cb) => string | String or function that returns a string that will be used as the filename
trash|string|Alternative text for trash text. [See Validation Note](#Big-Note-on-Validator)
validator|(req,file,cb) => boolean| [See Validation](#Validation)

## Validation
Sometimes when uploading a file, it will be partnered with a form with data populated on req.body. What if you need to validate that form data *before* proceeding to upload the file? That's where this function comes in! 

Here is an example:
```javascript
/**
 * You will have access to Express's req.body
 * 
 * You can validate anything you wish and return true/false
 * on whether you want the file to upload (true = upload)
 * 
 * True or false will still move your app to the next 
 * middleware in your route. Calling cb(err) will result in Multer
 * calling next(err) in your app
 * 
 * This example manually calls JOI's (a validation library for NodeJS)
 * validation function to validate the fields on req.body
 * 
 * You can create a more complex function that checks on which
 * path the client is visiting to decide which validator to use.
 * This prevents you from having to create another RemoteStorage
 * instance for each type of validator
 */
const handleTopicValidation = (req, file, cb) => {
    let output = true;
        try {
            const {error, value} = topicValidator.validate(req.body);
            if (error) output = false;
        } catch(err) {
            cb(err); //Will result in Multer calling next(err)
        }
        return output;
}

const storage = new RemoteStorage({
    target: 'CLOUDINARY',
    config: {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
        secure: true,
    },
    params: {
        folder: 'myfolder',
    },
    options: {
        chunk_size:1024 * 256 * 5,
        validator: handleTopicValidation
    },
});

export { storage };

```
### Big Note on Validator
If you pass false, thus bypassing file upload, the software still has to pipe the readable stream somewhere. As a solution, it will use `fs`'s `createWriteStream` function to create a file to dump the data in. Immediately afterwards, it will call `fs`'s `rm` function to delete that file.

Two notes:
1. Make sure your Node app has writing privileges in its own directory. Otherwise, you might get an `Access Denied` error. This is usually not an issue.
2. The default filename created is called `trash.txt`. You can use the `trash` option to customize the filename so it doesn't conflict with any files you may have.

## Public Id
The `public_id` option allows you to define a string, or a function that returns a string, to deal with naming the file you upload. Using this property may overwrite any similar function in the `params` object for the client you are using.

NOTE: Cloudinary does NOT want the file extension in the filename whereas Google Cloud Storage and AWS S3 do.

```javascript
const handlePublicId = (req,file,cb) => {
    /*
        This example uses the date object to ensure a unique filename and assumes only
        one dot (prior to extension) exists
    */
    return `${file.originalname.split('.')[0]}-${Date.now()}.${file.originalname.split('.')[1]}`
}

const s3Storage = new RemoteStorage({
    target: 'AWS_S3',
    config: {
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        },
        region: process.env.S3_REGION
    },
    params: {
        Bucket: 'mybucket'
    },
    options: {
        chunk_size: 1024 * 1000 * 10,
        public_id: handlePublicId
    }
});

export { s3Storage };
```

## TypeScript Example

**BIG NOTE**: RemoteStorage's `target` property can only be set to `AWS_S3`, `GCS`, or `CLOUDINARY`. This will dynamically affect the typings for the other three properties: `config`, `params`, and `options`. See the [configuration](#Configuration) section above for typings.

```typescript
import { RemoteStorage } from 'multer-remote-storage';
import topicValidator from './validators/topicValidator'; //JOI validation object

//Types
import { Request } from 'express';
import { File, MulterCallback } from 'multer-remote-storage';

const handleTopicValidation = (req: Request, file: File, cb: MulterCallback) => {
    let output = true;
    try {
        const { error, value } = topicValidator.validate(req.body); //JOI validator
        if (error) output = false;
    } catch (err) {
        output = false;
    }
    return output;
}

const handlePublicId = (req: Request, file: File, cb: MulterCallback) => {
    return `${file.originalname.split('.')[0]}-${Date.now()}}`
}

const storage = new RemoteStorage({
    target: 'CLOUDINARY',
    /*
        config's type will change depending on whether the 'target' property
        above is CLOUDINARY, GCS, or AWS_S3
    */
    config: {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
        secure: true,
    },
    params: {
        folder: 'MyFolder',
    },
    options: {
        public_id: handlePublicId,
        validator: handleTopicValidation
    },
});

export { storage };
```

## Release Notes

For those who used versions < 1.0.0, please continue below to see how to update your code. 

### Changes

Due to frequent typing conflicts, all storage clients are now dependencies of this package and are completely self-contained. You will no longer need to install Cloudinary, Amazon, or Google's storage clients to use this package. As such, configuring RemoteStorage class is now different.

Below is a visual of the change using AWS S3 as an example.

#### Before

```javascript
import { S3Client } from '@aws-sdk/client-s3';
import { RemoteStorage } from 'multer-remote-storage';

const s3Storage = new RemoteStorage({
    client: new S3Client({
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        },
        region: process.env.S3_REGION,
    }),
    params: {
        bucket:'mybucket'
    },
    options: {
        public_id: handlePublicId
    }
});

export { s3Storage }
```

#### After

```javascript
//No longer importing S3Client as it's no longer needed
import { RemoteStorage } from 'multer-remote-storage';

const s3Storage = new RemoteStorage({
    target: 'AWS_S3', //This is now required (AWS_S3 or GCS or CLOUDINARY)
    /*
        'config' replaces 'client' and you pass the config options here 
        instead of an instance of the client you wish to use. The package 
        handles all of that for you.
    */
    config: {
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        },
        region: process.env.S3_REGION,
    },
    params: {
        Bucket:'mybucket' //Notice Bucket is capitalized ONLY for AWS, see Errors
    },
    options: {
        public_id: handlePublicId
    }
});
```

### Errors

#### Object literal may only specify known properties but bucket does not exist in type s3Params

Due to the dynamic typing that's been introduced on the `RemoteStorage` class, the `params` property will adjust depending on whether the `target` property is set to `AWS_S3`, `GCS`, or `CLOUDINARY`. AWS's properties in `params` are capitalized to match the config options with S3's client SDK which are also capitalized. See the `params` property for S3 [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-storage/).