declare const getOptions: (url: string) => {
    options: {
        url: string;
        package: string[];
        protoPath: string[];
    };
};
export default getOptions;
