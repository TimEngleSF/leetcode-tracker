export class ExtendedError extends Error {
    statusCode?: number;
}

export const createExtendedError = ({
    message,
    statusCode,
    stack
}: {
    message?: string;
    statusCode?: number;
    stack?: any;
}) => {
    const extendedError = new ExtendedError(
        message ? message : `Internal Service Error`
    );
    extendedError.statusCode = statusCode;
    extendedError.stack = stack;
    return extendedError;
};
