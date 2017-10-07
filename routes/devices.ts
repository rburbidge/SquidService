import { AddDeviceBody, CommandBody, DeviceModel, ErrorCode } from '../exposed/squid';
import { Device } from '../data/models/device';
import { Devices } from '../data/devices';
import { ErrorModel } from '../models/error-model';
import { ErrorHelper } from './error-helper';
import { Google, MessageType } from '../services/google';
import { googleAuth } from '../auth/google-auth';
import { User } from '../data/models/user';
import { Validate } from '../core/validate';
import * as https from 'https';
import * as express from 'express';
import * as tex from '../core/typed-express';

/** The devices router. */
export class DevicesRouter {
    /** The express router. */
    public readonly router: express.Router;

    /**
     * Creates a new instance.
     * @param devicesDb The devices database.
     * @param google The Google service.
     */
    constructor(private readonly devicesDb: Devices, private readonly google: Google) {
        this.router = express.Router();

        this.devicesDb = devicesDb;
        this.init(devicesDb);
    }

    /** Initializes the router. */
    private init(devicesDb: Devices): void {
        this.router.use(googleAuth(this.google));

        // Note that this is the only place in the code where 'any' is allowed
        // There is no way to ensure that requests match contracts is to write auto-generated validators from TS interfaces
        this.router.route('')
            .get((req, res) => { this.getDevices(req as any, res); })
            .post((req, res) => { this.addDevice(req as any, res); })
        this.router.route('/:deviceId')
            .delete((req, res) => { this.deleteDevice(req as any, res); });
        this.router.route('/:deviceId/commands')
            .post((req, res) => { this.command(req as any, res); });
    }

    /**
     * Get the devices that a user owns.
     */
    private getDevices(req: tex.IAuthed, res: express.Response): void {
        this.devicesDb.getUser(req.user.id)
            .then((user: User) => {
                let deviceModels: DeviceModel[] = user.devices.map((value: Device) => DevicesRouter.convert(value));
                res.status(200).send(deviceModels);    
            })
            .catch((error) => {
                res.status(404).send(new ErrorModel(ErrorCode.UserNotFound, 'The user does not exist'));
            });
    }

    /**
     * Add a new device to a user. Creates the user if they do not exist.
     */
    @Validate(
        function(req: express.Request)
        {
            req.checkBody('name', 'Must pass name').notEmpty();
            req.checkBody('gcmToken', 'Must pass gcmToken').notEmpty();
            req.checkBody('deviceType', 'Must pass type').notEmpty();
        })
    private addDevice(req: tex.IBody<AddDeviceBody>, res: express.Response): void {
        this.devicesDb.addDevice(req.user.id, req.body)
            .then(addDeviceResult => {
                res.status(addDeviceResult.added ? 200 : 302)
                   .send(DevicesRouter.convert(addDeviceResult.device));
            })
            .catch((error: any) => {
                console.error(`Add device failed: ${error}`);
                ErrorHelper.send(res, error);
            });
    }

    /**
     * Delete a user's device.
     * 
     * Returns 404 if the user or device does not exist.
     */
    @Validate(DevicesRouter.validateDeviceId)
    private deleteDevice(req: tex.IAuthed, res: express.Response): void {
        this.devicesDb.removeDevice(req.user.id, req.params.deviceId)
            .then((deleted: boolean) => {
                console.log(deleted
                    ? 'Device ' + req.params.deviceId + ' deleted'
                    : 'Device ' + req.params.deviceId + ' did NOT exist');
                res.status(200).send();
            })
            .catch(() => {
                console.log('User does not exist');
                ErrorHelper.send(res, ErrorModel.fromErrorCode(ErrorCode.UserNotFound));;
            });
    }

    /**
     * Sends a command to a user's device.
     * 
     * Returns 404 if the user does not exist.
     */
    @Validate(DevicesRouter.validateDeviceId)
    private command(req: tex.IBodyAndUrlParams<CommandBody, DeviceUrlParams>, res: express.Response): void {
        this.devicesDb.getUser(req.user.id)
            .then(user => {
                let device: Device = user.devices.filter(d => d.id === req.params.deviceId)[0];
                if(!device) {
                    ErrorHelper.send(res, ErrorModel.fromErrorCode(ErrorCode.UserNotFound));
                    return;
                }

                this.google.sendGcmMessage(
                    {
                        type: MessageType.Url,
                        data: req.body.url,
                    },
                    device.gcmToken)
                    .then(() => {
                        res.status(200).end();
                    })
                    .catch(error => {
                        ErrorHelper.send(res, error);
                    });
            })
            .catch(() => {
                ErrorHelper.send(res, ErrorModel.fromErrorCode(ErrorCode.UserNotFound));
            });
    }

    /** Validates that there is a non-empty device ID URL parameter. */
    private static validateDeviceId(req: express.Request) {
        req.check('deviceId', 'Must pass deviceId').notEmpty();
    }

    /** Converts a Device to DeviceModel. */
    private static convert(device: Device): DeviceModel {
        return {
            id: device.id,
            name: device.name,
            deviceType: device.deviceType
        };
    }
}

interface DeviceUrlParams {
    /** The device ID. */
    deviceId: string
}

/**
 * Creates the devices express router.
 * @param devicesDb The devices database.
 */
export function devicesRouter(devicesDb: Devices, google: Google): express.Router {
    const router = new DevicesRouter(devicesDb, google);
    return router.router;
}