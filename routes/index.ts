import * as express from 'express';

/** The index router */
class IndexRouter {
    public readonly router;

    constructor() {
        this.router = express.Router();
        this.router.get('', function(req: express.Request, res: express.Response) {
            res.render('index', {title: 'Foo McBarington'});
        });
    }
}

/** Creates the index express router. */
export function indexRouter(): express.Router {
    return new IndexRouter().router;
}