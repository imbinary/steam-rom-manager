import * as _Bluebird from 'bluebird';

export interface xRequestOptions {
    method: 'GET',
    timeout: number,
    params?: String | Object,
    responseType?: XMLHttpRequestResponseType,
    headers?: Object
}

export interface xRequestOptionsWithUrl extends xRequestOptions {
    url: string
}

export interface xRequestError {
    config: xRequestOptionsWithUrl,
    response?: xRequestResponse,
    error: {
        status: number,
        statusText: string,
        url: string,
        headers: {}
    }
}

export type xRequestResponse = any;
export type xRequestResolve = xRequestResponse | null;
export type xRequestReject = xRequestError | any;