import * as express from 'express';

export interface IAuthed extends express.Request {
    /** The user ID provided by auth. */
    user: string;
}

export interface IBody<TBody> extends IAuthed {
    /** The body JSON object. */
    body: TBody;
}

export interface IUrlParams<TUrlParams> extends IAuthed {
    /** Object containing URL params. */
    params: TUrlParams;
}