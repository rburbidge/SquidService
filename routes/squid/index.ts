import * as express from 'express';

/** The index router */
class SquidIndexRouter {
    public readonly router;

    constructor() {
        this.router = express.Router();

        this.router.get('/instructions', (req: express.Request, res: express.Response) => {
            this.renderInstructions(res);
        });

        this.router.get('/test', (req: express.Request, res: express.Response) => {
            res.render('squid/test', { title: 'Squid' });
        });

        /** This is a legacy route that can be removed once the Android and Chrome apps update. */
        this.router.get('/instructions.html', (req: express.Request, res: express.Response) => {
            this.renderInstructions(res);
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