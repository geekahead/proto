"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const qiniu = require("qiniu");
const path = require("path");
const fs = require("fs");
const uuid_1 = require("uuid");
const accessKey = 'O7TBV3YRF_foxe0JQMchd696WQt4JWE1nqwrJifV';
const secretKey = 'E8CuPXlrCnubiBEd67twMP7ZnT_c3tJH0Sla5Tna';
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const bucket = process.env.QN_BUCKET;
const options = {
    scope: bucket,
    returnBody: '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)","name":"$(fname)"}'
};
const putPolicy = new qiniu.rs.PutPolicy(options);
const config = new qiniu.conf.Config({
    useHttpsDomain: true,
    useCdnDomain: true
});
class Resources {
    static uploadStream(stream, key) {
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
                }
                else {
                    reject(respBody);
                }
            });
        });
    }
    static uploadBlob(blob, key) {
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
                }
                else {
                    reject(respBody);
                }
            });
        });
    }
    static uploadLocalFile(filePath, key) {
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
                }
                else {
                    reject(respBody);
                }
            });
        });
    }
    static getDownloadUrl(key) {
        if (!key) {
            return "";
        }
        if (/^(http(s)?:)?\/\//.test(key)) {
            return key;
        }
        const bucketManager = new qiniu.rs.BucketManager(mac, config);
        return bucketManager.publicDownloadUrl(this.cdn, key);
    }
    static walk(dir) {
        const files = fs.readdirSync(dir);
        const fileList = [];
        for (let i = 0; i < files.length; i++) {
            const name = files[i];
            const filePath = path.join(dir, name);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                fileList.push(filePath);
            }
            else if (stat.isDirectory()) {
                fileList.push(...this.walk(filePath));
            }
        }
        return fileList;
    }
    static async uploadLocalDir(dir, dirKey = uuid_1.v4()) {
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
Resources.cdn = process.env.QN_CDN;
exports.default = Resources;
