export enum CommandTopic {
  PROVIDE_STATUS = 'provideStatus',
  REQUEST_COP = 'requestCop',
  RESPONSE_COP = 'responseCop',
  REGISTER_TEAM_MEMBER = 'register',
  UNREGISTER = 'unregister',
  ADD_TARGET_TO_MAP = 'addTargetToMap',
}

export class MessageBase {
  constructor(properties?: any) {
    properties && this.override(properties);
  }

  override(data: any) {
    Object.keys(data).forEach((key) => {
      this[key] = data[key];
    });
  }

  private _channel: string = '';
  setChannel(name: string) {
    this._channel = name;
    return this;
  }

  myChannel() {
    const value = `${this._channel}`;
    delete this._channel;
    return value;
  }
}

export class ChatMessage extends MessageBase {
  user: string;
  message: string;

  constructor(properties?: any) {
    super(properties);
    properties && this.override(properties);
    this.setChannel(`ChatMessage`);
  }
}

export class Position extends MessageBase {
  userId: string;
  name: string;
  position: [number, number];

  constructor(properties?: any) {
    super(properties);
    properties && this.override(properties);
    this.setChannel(`Position`);
  }
}

export class CommandMessage extends MessageBase {
  topic: string;
  payload: any;

  isTopicOfInterest(interestedIn: CommandTopic): boolean {
    return this.topic === interestedIn;
  }

  constructor(properties?: any) {
    super(properties);
    properties && this.override(properties);
    this.setChannel(`CommandMessage`);
  }
}

export class StatusMessage extends MessageBase {
  userId: string;
  application: string;

  constructor(properties?: any) {
    super(properties);
    properties && this.override(properties);
    this.setChannel(`StatusMessage`);
  }
}
