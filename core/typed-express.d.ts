import { User }  from '../auth/user';
import * as express from 'express';

/**
 * An authed request.
 */
export interface IAuthed extends express.Request {
    /** The user provided by auth. */
    user: User;
}

/**
 * A request with a typed request body.
 */
export interface IBody<TBody> extends IAuthed {
    /** The body JSON object. */
    body: TBody;
}

/**
 * A request with typed URL params.
 */
export interface IUrlParams<TUrlParams> extends IAuthed {
    /** Object containing URL params. */
    params: TUrlParams;
}

/**
 * A request with typed body and URL params.
 * 
 * * TypeScript does not support multiple interface extension.
 */
export interface IBodyAndUrlParams<TBody, TUrlParams> extends IBody<TBody> {
    /** Object containing URL params. */
    params: TUrlParams;
}