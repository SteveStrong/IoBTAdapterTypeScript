import { EnvConfig } from '.';
import { Toast } from './emitter.service';
import { ModelBase } from './model-base';
import { environment } from '../../environments/environment';

export interface IEnvVars {
    baseURL: string;
}

export interface IServiceOptions {
    serviceKey: string;
    endpoint: string;
    localDataPath?: string;
    localMockData?: boolean;
    forceLocalMock?: boolean;
}

export class ServiceLocator extends ModelBase implements IServiceOptions {
    serviceKey: string; // update config-local and config when you add a new service
    endpoint: string;
    localDataPath: string;
    localMockData = false;
    forceLocalMock = false;

    static baseURL = environment.baseURL;

    constructor(properties?: IServiceOptions) {
        super();
        this.override(properties);

        const found = EnvConfig.services[this.serviceKey];
        found && this.override(found);
    }

    public getUrl(): string {
        const localMockData: boolean = this.localMockData;
        const localDataPath: string = this.localDataPath;

        if (localMockData) {
            Toast.info(`Using MOCK DATA for ${this.serviceKey}`);
            return `${EnvConfig.localMockPath}${localDataPath}`;
        } else if (this.forceLocalMock) {
            Toast.warning(`PENDING Service ${this.serviceKey}: FORCING MOCK DATA`);
            return `${EnvConfig.localMockPath}${localDataPath}`;
        }

        const longPath = `${ServiceLocator.baseURL}`;
        const url = `${longPath}${this.endpoint}`;
        return encodeURI(url);
    }

    public getClientHubUrl(): string {
        const url = `${ServiceLocator.baseURL}${this.endpoint}`;
        return encodeURI(url);
    }

    public getAPIUrl(): string {
        const localMockData: boolean = this.localMockData;
        const localDataPath: string = this.localDataPath;

        if (localMockData) {
            Toast.info(`Using MOCK DATA for ${this.serviceKey}`);
            return `${EnvConfig.localMockPath}${localDataPath}`;
        } else if (this.forceLocalMock) {
            Toast.warning(`PENDING Service ${this.serviceKey}: FORCING MOCK DATA`);
            return `${EnvConfig.localMockPath}${localDataPath}`;
        }

        const longPath = `${ServiceLocator.baseURL}`;
        const url = `${longPath}${environment.rootAPIPath}${this.endpoint}`;
        return encodeURI(url);
    }
}
