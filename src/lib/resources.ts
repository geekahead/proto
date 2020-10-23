// 资源管理类
import * as qiniu from "qiniu";
import * as path from "path";
import * as fs from "fs";
import {v4 as uuid} from "uuid";


const accessKey = 'O7TBV3YRF_foxe0JQMchd696WQt4JWE1nqwrJifV';
const secretKey = 'E8CuPXlrCnubiBEd67twMP7ZnT_c3tJH0Sla5Tna';


const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

// 要上传的空间
const bucket = process.env.QN_BUCKET;

const options = {
    scope: bucket,
    returnBody: '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)","name":"$(fname)"}'
}

const putPolicy = new qiniu.rs.PutPolicy(options);


const config = new qiniu.conf.Config({
    useHttpsDomain: true,
    useCdnDomain: true
});

declare interface IUploadCallback {
    key: string;
    hash: string;
    size: number;
    bucket: string;
    name: string;
}

class Resources {
    public static cdn = process.env.QN_CDN;

    public static uploadStream(stream: NodeJS.ReadableStream, key?: string): Promise<IUploadCallback> {
        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();
        return new Promise((resolve, reject) => {
            const uploadToken = putPolicy.uploadToken(mac);
            return formUploader.putStream(uploadToken, key, stream, putExtra, function (respErr, respBody, respInfo) {
                if (respErr) {
                    reject(respErr);
                }
                if (respInfo.statusCode == 200) {
                    resolve(respBody);
                } else {
                    reject(respBody);
                }
            });
        });
    }

    public static uploadBlob(blob: Blob, key?: string): Promise<IUploadCallback> {
        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();
        return new Promise((resolve, reject) => {
            const uploadToken = putPolicy.uploadToken(mac);
            return formUploader.put(uploadToken, key, blob, putExtra, function (respErr, respBody, respInfo) {
                if (respErr) {
                    reject(respErr);
                }
                if (respInfo.statusCode == 200) {
                    resolve(respBody);
                } else {
                    reject(respBody);
                }
            });
        });
    }

    /**
     *
     * @param filePath   本地文件路径
     * @param key   文件目录及文件名
     */
    public static uploadLocalFile(filePath: string, key?: string): Promise<IUploadCallback> {
        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();
        return new Promise((resolve, reject) => {
            const uploadToken = putPolicy.uploadToken(mac);
            formUploader.putFile(uploadToken, key, filePath, putExtra, function (respErr, respBody, respInfo) {
                if (respErr) {
                    reject(respErr);
                }

                if (respInfo.statusCode == 200) {
                    resolve(respBody);
                } else {
                    reject(respBody);
                }
            });
        });
    }

    public static getDownloadUrl(key: string) {
        // if startWith http(s)://
        if(/^(http(s)?:)?\/\//.test(key)){
            return key;
        }
        const bucketManager = new qiniu.rs.BucketManager(mac, config);
        return bucketManager.publicDownloadUrl(this.cdn, key);
    }


    private static walk(dir: string) {
        const files = fs.readdirSync(dir);
        const fileList: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const name = files[i];
            const filePath = path.join(dir, name);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                fileList.push(filePath);
            } else if (stat.isDirectory()) {
                fileList.push(...this.walk(filePath));
            }
        }
        return fileList;
    }

    public static async uploadLocalDir(dir: string, dirKey: string = uuid()) {
        const fileList = this.walk(dir);
        for (let i = 0; i < fileList.length; i++) {
            const filePath = fileList[i];
            const fpath = filePath.replace(dir, '');
            const targetKey = path.join(dirKey, fpath).replace(/\\/g, '/');
            await this.uploadLocalFile(filePath, targetKey);
        }
        return dirKey;
    }
}

export default Resources;


