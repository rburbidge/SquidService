import * as express from 'express';

/** The index router */
class IndexRouter {
    public readonly router;

    constructor() {
        this.router = express.Router();
        this.router.get('', function(req: express.Request, res: express.Response) {
            res.writeHead(200);
            res.end('Hello Server');
        });
    }
}

/** Creates the index express router. */
export function indexRouter(): express.Router {
    return new IndexRouter().router;
}