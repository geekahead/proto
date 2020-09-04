import {ClientOptions, Transport} from '@nestjs/microservices';
import {join} from 'path';

/**
 *
 * @param url grpc 服务地址
 */
const getOptions=(url:string):ClientOptions=>{
    return {
        transport: Transport.GRPC,
        options: {
            url: url,
            package: ['doc', 'transform'],
            protoPath: [join(__dirname, './doc.proto'), join(__dirname, './transform.proto')],
        },
    };
}

export default getOptions;
