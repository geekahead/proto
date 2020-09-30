"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const getOptions = (url) => {
    return {
        options: {
            url: url,
            package: ['doc', 'transform'],
            protoPath: [path_1.join(__dirname, './doc.proto'), path_1.join(__dirname, './transform.proto')],
        },
    };
};
exports.default = getOptions;
