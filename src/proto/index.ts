import {join} from 'path';

/**
 *
 * @param url grpc 服务地址
 */
const getOptions=(url:string)=>{
    return {
        options: {
            url: url,
            package: ['doc', 'transform'],
            protoPath: [join(__dirname, './doc.proto')],
        },
    };
}

export default getOptions;
