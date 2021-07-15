import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { LogLevel } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Toast } from '../shared/emitter.service';
import { ServiceLocator } from '../shared/service-locator';
import { environment } from '../../environments/environment';

import { ClientHub, UDTO_Base, UDTO_ChatMessage, UDTO_Command, UDTO_Generic, UDTO_Objective, UDTO_Observation, UDTO_Platform, UDTO_Position, UDTO_Status } from '../models/UDTO-message';
import { Tools } from '../shared/foTools';

import { GeolocationHelper } from '../models';
@Injectable({
    providedIn: 'root'
})
export class TopicService {
    connection: signalR.HubConnection;
    sourceGUID: string;
    personId: string;

    lastLat: number;
    lastLng: number;

    pongSubject: Subject<any>;
    subjects: Map<keyof ClientHub, Subject<any>> = new Map<keyof ClientHub, Subject<any>>();

    get summary(): any {
        return {
            personId: this.personId,
            sourceGUID: this.sourceGUID,
            lat: this.lastLat,
            lng: this.lastLng
        };
    }

    constructor() {
        this.sourceGUID = Tools.generateUUID();
        this.personId = Tools.randomName();

        this.resetPosition(() => {});
    }

    resetPosition(done: () => void) {
        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition) => {
                this.lastLat = position.coords.latitude;
                this.lastLng = position.coords.longitude;
                done();
            },
            () => {
                // Use default lat/lng if cannot get current position
                Toast.warning('getCurrentPosition() and watchPosition() only work with secure origins', 'use https');
                [this.lastLat,this.lastLng] = environment.defaultLatLng;

                done();
            }
        );
    }

    movePosition(deltaLat: number, deltaLng: number) {
        this.lastLat += deltaLat;
        this.lastLng += deltaLng;
    }

    getClientHubUrl(): string {
        const serviceOptions = new ServiceLocator({
            serviceKey: 'clientHub$',
            endpoint: `/clientHub`
        });

        const url = serviceOptions.getClientHubUrl();
        return url;
    }

    establishHubConnection() {
        if (this.connection) {
            return this.connection;
        }

        const serviceOptions = new ServiceLocator({
            serviceKey: 'chatService$',
            endpoint: `/clientHub`
        });

        const url = serviceOptions.getClientHubUrl();
        Toast.info('Hub Connection', url);

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(url, {
                withCredentials: false,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .configureLogging(LogLevel.Debug)
            .build();

        return this.connection;
    }

    doStart(success: () => void, failure: () => void) {
        if (this.connection) {
            // Toast.warning('reuse connection');
            success();
            return;
        }

        //https://docs.microsoft.com/en-us/aspnet/core/tutorials/signalr?tabs=visual-studio&view=aspnetcore-5.0

        this.establishHubConnection()
            .start()
            .then(() => {
                // Toast.success('topic hub is ready');
                success();
            })
            .catch((error) => {
                Toast.error(`${error.message}`, 'topic hub has failed');
                console.log(error.stack);
                failure();
            });
        // .finally(() => {
        //     Toast.warning('topic connection complete');
        // });
    }

    doStop(success: () => void) {
        if (this.connection) {
            this.connection.stop();
            this.connection.onclose(success);
            this.connection = undefined;
        }
    }

    public Estabish$<T extends UDTO_Base>(topic: keyof ClientHub): Subject<T> {
        if (!this.subjects.has(topic)) {
            const s = new Subject<UDTO_Base>();
            this.subjects.set(topic, s);
            this.connection.on(topic, (data) => {
                const MessageType = new ClientHub()[topic];
                s.next(new MessageType(data));
            });
        }
        return this.subjects.get(topic);
    }

    public Pong$(): Subject<any> {
        if (!this.pongSubject) {
            this.pongSubject = new Subject<any>();
            this.connection.on('Pong', (data) => {
                this.pongSubject.next(data);
            });
        }

        return this.pongSubject;
    }

    doPing() {
        const msg = `Everybody play ping pong ${Tools.getNowIsoDate()}`;
        this.connection.invoke('Ping', msg);
    }

    doPingPong() {
        const msg = `Others play ping pong ${Tools.getNowIsoDate()}`;
        this.connection.invoke('PingPong', msg);
    }

    private getBaseData() {
        return {
            sourceGuid: this.sourceGUID,
            timeStamp: Tools.getNowIsoDate(),
            personId: this.personId
        };
    }

    public Generic$(): Subject<UDTO_Generic> {
        return this.Estabish$<UDTO_Generic>('Generic');
    }

    public sendGeneric(data: UDTO_Generic) {
        data.override(this.getBaseData());
        this.connection.invoke('Generic', data);
    }

    public ChatMessage$(): Subject<UDTO_ChatMessage> {
        return this.Estabish$<UDTO_ChatMessage>('ChatMessage');
    }

    // public sendChatMessage(data: UDTO_ChatMessage) {
    //     data.override(this.getBaseData());
    //     this.connection.invoke('ChatMessage', data);
    // }

    public sendChatMessageMesh(data: UDTO_ChatMessage) {
        data.override(this.getBaseData());
        this.connection.invoke('ChatMessageMesh', data, true);
    }

    public Position$(): Subject<UDTO_Position> {
        return this.Estabish$<UDTO_Position>('Position');
    }

    public sendPosition(data: UDTO_Position) {
        data.override(this.getBaseData());
        data.user = this.personId;
        this.connection.invoke('Position', data);
    }

    public Objective$(): Subject<UDTO_Objective> {
        return this.Estabish$<UDTO_Objective>('Objective');
    }

    public sendObjective(data: UDTO_Objective) {
        data.override(this.getBaseData());
        this.connection.invoke('Objective', data);
    }

    public Observation$(): Subject<UDTO_Observation> {
        return this.Estabish$<UDTO_Observation>('Observation');
    }

    public sendObservation(data: UDTO_Observation): UDTO_Observation {
        data.override(this.getBaseData());
        data.lat = Boolean(data.lat) ? data.lat : this.lastLat;
        data.lng = Boolean(data.lng) ? data.lng : this.lastLng;
        this.connection.invoke('Observation', data);
        return data;
    }

    public Platform$(): Subject<UDTO_Platform> {
        return this.Estabish$<UDTO_Platform>('Platform');
    }

    public sendPlatform(data: UDTO_Platform): UDTO_Platform {
        data.override(this.getBaseData());
        data.lat = Boolean(data.lat) ? data.lat : this.lastLat;
        data.lng = Boolean(data.lng) ? data.lng : this.lastLng;
        this.connection.invoke('Platform', data);
        return data;
    }

    public Status$(): Subject<UDTO_Status> {
        return this.Estabish$<UDTO_Status>('Status');
    }

    public sendStatus(data: UDTO_Status) {
        data.override(this.getBaseData());
        this.connection.invoke('Status', data);
    }

    public Command$(): Subject<UDTO_Command> {
        return this.Estabish$<UDTO_Command>('Command');
    }

    public sendCommand(data: UDTO_Command) {
        data.override(this.getBaseData());
        this.connection.invoke('Command', data);
    }

    doUpdatePosition(position: GeolocationPosition) {
        const data = new UDTO_Position(GeolocationHelper.cloneCoords(position));
        this.sendPosition(data);
    }
}
