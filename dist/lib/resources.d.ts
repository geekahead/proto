/// <reference types="node" />
declare interface IUploadCallback {
    key: string;
    hash: string;
    size: number;
    bucket: string;
    name: string;
}
declare class Resources {
    static cdn: string;
    static uploadStream(stream: NodeJS.ReadableStream, key?: string): Promise<IUploadCallback>;
    static uploadBlob(blob: Blob, key?: string): Promise<IUploadCallback>;
    static uploadLocalFile(filePath: string, key?: string): Promise<IUploadCallback>;
    static getDownloadUrl(key: string): string;
    private static walk;
    static uploadLocalDir(dir: string, dirKey?: string): Promise<string>;
}
export default Resources;
