import * as express from 'express';

/** The index router */
class SquidIndexRouter {
    public readonly router;

    constructor() {
        this.router = express.Router();

        this.router.get('/about', (req: express.Request, res: express.Response) => {
            res.render('squid/about', { title: 'About Squid' });
        });

        /** A how to page. */
        this.router.get('/instructions', (req: express.Request, res: express.Response) => {
            this.renderInstructions(res);
        });

        /** This page is used when the user sends a test link. */
        this.router.get('/test', (req: express.Request, res: express.Response) => {
            res.render('squid/test', { title: 'Squid' });
        });
    }

    private renderInstructions(res: express.Response): void {
        res.render('squid/instructions', { title: 'How to use Squid' });
    }
}

/** Creates the index express router. */
export function squidIndexRouter(): express.Router {
    return new SquidIndexRouter().router;
}