import { Tools } from './foTools';
import { Constructable } from '.';
import { MessageBase } from '../models/iobt-message';

export const sourceGuid = Tools.generateUUID();
export interface IContextWrapper<T extends MessageBase> {
  payloadType: string;
  payload: Array<T>;
  message: string;
}
export class ContextWrapper<T extends MessageBase> {
  dateTime: string;
  sourceGuid: string;
  messageGuid: string;

  payloadType: string;
  payload: Array<T>;
  length: number;

  hasError: boolean = false;
  message: string = '';

  addToPayload(payload: T): ContextWrapper<T> {
    if (this.payload === undefined) {
      this.payload = [];
      this.payloadType = payload.myChannel();
    }
    this.payload.push(payload);
    this.length = this.payload.length;
    return this;
  }

  addListToPayload(list: T[]): ContextWrapper<T> {
    if (this.payload === undefined) {
      this.payload = [];
      this.payloadType = list[0].myChannel();
    }
    this.payload.concat(list);
    this.length = this.payload.length;
    return this;
  }

  setError(message: string): ContextWrapper<T> {
    this.hasError = true;
    this.message = message;
    return this;
  }

  asString() {
    return Tools.stringify(this);
  }

  initialize(type: Constructable<T>, properties?: IContextWrapper<T>) {
    Object.assign(this, { ...properties });
    this.sourceGuid = this.sourceGuid || sourceGuid;
    this.messageGuid = this.messageGuid || Tools.generateUUID();
    this.length = this.payload ? this.payload.length : 0;
    return this;
  }

  log(context: string) {
    console.log(`${context}=`, this.asString());
  }

  getFirstOrDefault(): T {
    return this.payload[0];
  }

  isNotMe(): boolean {
    return this.sourceGuid !== sourceGuid;
  }

  static create<T extends MessageBase>(type: Constructable<T>, a: any) {
    const c = new ContextWrapper<T>(type, a);
    c.hasError = !(c.payloadType === type.name);
    return c;
  }

  constructor(type: Constructable<T>, properties?: IContextWrapper<T>) {
    this.initialize(type, properties);
    this.dateTime = Tools.getNowIsoDate();
  }
}
