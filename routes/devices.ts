import { AddDeviceBody, CommandBody, DeviceModel, ErrorCode, DeviceType } from '../exposed/squid';
import { Device } from '../data/models/device';
import { Devices } from '../data/devices';
import { ErrorModel } from '../models/error-model';
import { ErrorHelper } from './error-helper';
import { Google, MessageType } from '../services/google';
import { googleAuth } from '../auth/google-auth';
import { UserDevices } from '../data/models/user-devices';
import { Validate } from '../core/validate';
import { ITelemetry } from '../logging/telemetry';

import * as https from 'https';
import * as express from 'express';
import * as tex from '../core/typed-express';
import * as winston from 'winston';
import { EventType } from '../logging/event-type';
import { Users } from '../data/users';

/** The devices router. */
export class DevicesRouter {
    /** The express router. */
    public readonly router: express.Router;

    /**
     * Creates a new instance.
     * @param usersDb The users database.
     * @param devicesDb The devices database.
     * @param google The Google service.
     * @param telemetry The telemetry client.
     */
    constructor(
        private readonly usersDb: Users,
        private readonly devicesDb: Devices,
        private readonly google: Google,
        private readonly telemetry: ITelemetry)
    {
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
        this.devicesDb.getDevices(req.user.id)
            .then((devices: Device[]) => {
                let deviceModels: DeviceModel[] = devices.map((value: Device) => DevicesRouter.convert(value));
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
            // Set arbitrary max name length of 25 chars 
            req.checkBody('name', 'Must pass name between 1 and 25 chars').notEmpty().len(1, 25);

            // According to https://stackoverflow.com/questions/11324666/android-gcm-registration-id-max-length,
            // the max GCM token size is 256. Using 512 chars just in case
            req.checkBody('gcmToken', 'Must pass valid gcmToken').notEmpty().len(1, 512);

            req.checkBody('deviceType', 'Must pass valid deviceType')
               .notEmpty()
               .isIn([DeviceType.android, DeviceType.chrome]);
        })
    private addDevice(req: tex.IBody<AddDeviceBody>, res: express.Response): void {
        const deviceType = req.body.deviceType;
        this.usersDb.addUser(req.user, deviceType)
            .then(wasAdded => {
                if(wasAdded) {
                    this.telemetry.trackEvent(EventType.UserCreate, {
                        originDeviceType: deviceType
                    });
                }
                return this.devicesDb.addDevice(req.user.id, req.body)
            })
            .then(addDeviceResult => {
                this.telemetry.trackEvent(EventType.DeviceCreate,
                    {
                        deviceType: deviceType,
                        deviceExisted: addDeviceResult.added.toString()
                    }
                );
                res.status(addDeviceResult.added ? 200 : 302)
                   .send(DevicesRouter.convert(addDeviceResult.device));
            })
            .catch((error: any) => {
                winston.warn(`Add device failed: ${error}`);
                ErrorHelper.send(res, error);
            });
    }

    /**
     * Delete a user's device.
     * 
     * Returns 404 if the user or device does not exist.
     */
    @Validate(DevicesRouter.validateDeviceId)
    private deleteDevice(req: tex.IUrlParams<DeviceUrlParams>, res: express.Response): void {
        this.devicesDb.removeDevice(req.user.id, req.params.deviceId)
            .then((deleted: boolean) => {
                winston.debug(deleted
                    ? 'Device ' + req.params.deviceId + ' deleted'
                    : 'Device ' + req.params.deviceId + ' did NOT exist');
                res.status(200).send();
            })
            .catch(() => {
                winston.debug('User does not exist');
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
        this.devicesDb.getDevices(req.user.id)
            .then(devices => {
                let device: Device = devices.filter(d => d.id === req.params.deviceId)[0];
                if(!device) {
                    ErrorHelper.send(res, ErrorModel.fromErrorCode(ErrorCode.DeviceNotFound));
                    return;
                }

                return this.google.sendGcmMessage(
                    {
                        type: MessageType.Url,
                        data: req.body.url,
                    },
                    device.gcmToken)
                    .then(() => {
                        this.telemetry.trackEvent(EventType.DeviceSendLink,
                            {
                                destDeviceType: device.deviceType,
                                url: req.body.url
                            });
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
 * @param usersDb The users database.
 * @param devicesDb The devices database.
 * @param google Google services.
 * @param telemetry Telemetry client.
 */
export function devicesRouter(usersDb: Users, devicesDb: Devices, google: Google, telemetry: ITelemetry): express.Router {
    const router = new DevicesRouter(usersDb, devicesDb, google, telemetry);
    return router.router;
}