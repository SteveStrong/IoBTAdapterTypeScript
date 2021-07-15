import { Constructable, Tools } from '../shared';

// https://www.npmjs.com/package/geolib

import * as turf from '@turf/turf';
import { Feature, Point, Polygon } from '@turf/turf';

export class ServerHub {
  ChatMessage = UDTO_ChatMessage;
  Command = UDTO_Command;
  Status = UDTO_Status;
}

export class ClientHub {
  ChatMessage = UDTO_ChatMessage;
  Command = UDTO_Command;
  Generic = UDTO_Generic;
  Objective = UDTO_Objective;
  Observation = UDTO_Observation;
  Position = UDTO_Position;
  Platform = UDTO_Platform;
  Status = UDTO_Status;
}

export interface IMessageView {
  sourceGuid: string;
  messageType: string;
  user: string;
  timeStamp: string;
  personId: string;
  uniqueGuid?: string;
  lat?: string;
  lng?: string;
  notes?: string;
}

export enum Objective {
  POINT_OF_INTEREST = 'POINT_OF_INTEREST',
  POSSIBLE_TARGET = 'POSSIBLE_TARGET',
  CONFIRMED_TARGET = 'CONFIRMED_TARGET'
}

export class UDTO_Base {
  sourceGuid: string;
  timeStamp: string;
  personId: string;

  constructor(properties?: any) {
    properties && this.override(properties);
  }

  override(data: any) {
    Object.keys(data).forEach((key) => {
      this[key] = data[key];
    });
  }

  public static asCoord(point: Feature<Point>) {
    return point.geometry.coordinates;
  }

  public static asLat(point: Feature<Point>) {
    return point.geometry.coordinates[1];
  }

  public static asLng(point: Feature<Point>) {
    return point.geometry.coordinates[0];
  }

  //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
  public calcCrow(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // km
    var dLat = this.toRad(lat2 - lat1);
    var dLon = this.toRad(lon2 - lon1);
    var lat1 = this.toRad(lat1);
    var lat2 = this.toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }

  // Converts numeric degrees to radians
  toRad(ang: number) {
    return (ang * Math.PI) / 180;
  }

  toDeg(ang: number) {
    return (ang * 180) / Math.PI;
  }

  //https://stackoverflow.com/questions/12219802/a-javascript-function-that-returns-the-x-y-points-of-intersection-between-two-ci

  computeIntersection(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
    var a: number, dx: number, dy: number, d: number, h: number, rx: number, ry: number;
    var x2: number, y2: number;

    /* dx and dy are the vertical and horizontal distances between
     * the circle centers.
     */
    dx = x1 - x0;
    dy = y1 - y0;

    /* Determine the straight-line distance between the centers. */
    d = Math.sqrt(dy * dy + dx * dx);

    /* Check for solvability. */
    if (d > r0 + r1) {
      /* no solution. circles do not intersect. */
      return false;
    }
    if (d < Math.abs(r0 - r1)) {
      /* no solution. one circle is contained in the other */
      return false;
    }

    /* 'point 2' is the point where the line through the circle
     * intersection points crosses the line between the circle
     * centers.
     */

    /* Determine the distance from point 0 to point 2. */
    a = (r0 * r0 - r1 * r1 + d * d) / (2.0 * d);

    /* Determine the coordinates of point 2. */
    x2 = x0 + (dx * a) / d;
    y2 = y0 + (dy * a) / d;

    /* Determine the distance from point 2 to either of the
     * intersection points.
     */
    h = Math.sqrt(r0 * r0 - a * a);

    /* Now determine the offsets of the intersection points from
     * point 2.
     */
    rx = -dy * (h / d);
    ry = dx * (h / d);

    /* Determine the absolute intersection points. */
    var xi = x2 + rx;
    var xi_prime = x2 - rx;
    var yi = y2 + ry;
    var yi_prime = y2 - ry;

    return [xi, xi_prime, yi, yi_prime];
  }

  getDisplayInfo(): IMessageView {
    return {
      sourceGuid: this.sourceGuid,
      messageType: 'Base',
      user: this.personId,
      timeStamp: this.timeStamp,
      personId: this.personId
    };
  }
}

export class UDTO_Generic extends UDTO_Base {
  topic: string;
  data: string;

  constructor(properties?: any) {
    super();
    properties && this.override(properties);
  }
}

export class UDTO_ChatMessage extends UDTO_Base {
  user: string;
  message: string;

  constructor(properties?: any) {
    super();
    properties && this.override(properties);
  }
}

export class UDTO_Status extends UDTO_Base {
  user: string;
  device: string;
  ammo: number;
  heartrate: number;
  ip_address: string;
  battery: string;
  notes: string;

  constructor(properties?: any) {
    super();
    properties && this.override(properties);
  }

  getDisplayInfo(): IMessageView {
    return {
      sourceGuid: this.sourceGuid,
      messageType: 'Status',
      user: this.personId,
      timeStamp: this.timeStamp,
      personId: this.personId,
      notes: `Device: ${this.device}, Ammo: ${this.ammo}, Heartrate: ${this.heartrate}, IP: ${this.ip_address}, Battery: ${this.battery} Notes: ${this.notes}`
    };
  }
}

export class UDTO_Command extends UDTO_Base {
  targetGuid: string;
  command: string;
  args: Array<string>;

  constructor(properties?: any) {
    super();
    properties && this.override(properties);
  }

  getDisplayInfo(): IMessageView {
    return {
      sourceGuid: this.sourceGuid,
      uniqueGuid: this.targetGuid,
      messageType: 'Command',
      user: this.personId,
      timeStamp: this.timeStamp,
      personId: this.personId,
      notes: this.args.toString()
    };
  }
}

export interface ILocation {
  lat: number;
  lng: number;
  alt: number;
  point(): Feature<Point>;
  distance(target: ILocation): number;
  bearing(target: ILocation): number;
  midpoint(target: ILocation): Feature<Point>;
  destination(distance: number, bearing: number): Feature<Point>;
  circlePolygon(radius: number): Feature<Polygon>;

  circleIntersect(radius1: number, target: ILocation, radius2: number): Array<Feature<Point>>;
}

export class Location extends UDTO_Base implements ILocation {
  lat: number;
  lng: number;
  alt: number;

  constructor(properties?: any) {
    super();
    properties && this.override(properties);
  }

  public point(): Feature<Point> {
    return turf.point([this.lng, this.lat]);
  }

  distance(target: ILocation): number {
    return turf.distance(this.point(), target.point());
  }

  bearing(target: ILocation): number {
    return turf.bearing(this.point(), target.point());
  }

  midpoint(target: ILocation): Feature<Point> {
    return turf.midpoint(this.point(), target.point());
  }

  destination(distance: number, bearing: number): Feature<Point> {
    return turf.destination(this.point(), distance, bearing);
  }

  circlePolygon(radius: number): Feature<Polygon> {
    const options = { steps: 30, Units: 'kilometers' };
    const result = turf.circle(this.point(), radius, options);
    return result;
  }

  boxPolygon(width:number, height: number, depth:number) : Feature<Polygon> {
    const w2 = width / 2.0;
    const d2 = depth / 2.0;
    const line = turf.lineString([
      [this.lng-w2, this.lat-d2], 
      [this.lng+w2, this.lat-d2], 
      [this.lng+w2, this.lat+d2], 
      [this.lng-w2, this.lat+d2], 
    ]);
    const bbox = turf.bbox(line);
    const result = turf.bboxPolygon(bbox);
    // const options = { steps: 30, Units: 'kilometers' };
    return result;
  }

  // bboxPolygon(radius: number): Feature<Polygon> {
  //   const options = { steps: 30, Units: 'kilometers' };
  //   const result = turf.circle(this.point(), radius, options);
  //   return result;
  // }

  circleIntersect(radius1: number, target: ILocation, radius2: number): Array<Feature<Point>> {
    const list: Array<Feature<Point>> = new Array<Feature<Point>>();

    //const result = this.computeIntersection(this.lng, this.lat, radius1, target.lng, target.lat, radius2);
    //list.push(turf.point([result[0], result[2]]));
    //list.push(turf.point([result[1], result[3]]));
    return list;
  }
}

export class UDTO_Position extends Location {
  user: string;

  speed: number;
  heading: number;

  constructor(properties?: any) {
    super();
    properties && this.override(properties);
  }

  getDisplayInfo(): IMessageView {
    return {
      sourceGuid: this.sourceGuid,
      messageType: 'Position',
      lat: `${this.lat}`,
      lng: `${this.lng}`,
      user: this.personId,
      timeStamp: this.timeStamp,
      personId: this.personId
    };
  }
}

export type units = 'ft' | 'm'
export class UDTO_Body extends UDTO_Base {
  parentPlatform: string;

  units: units 
  width: number;
  height: number;
  depth: number;

  locX: number;
  locY: number;
  locZ: number;
}
export class UDTO_Platform extends Location {
  uniqueGuid: string;
  platformName: string;

  units: units 
  width: number;
  height: number;
  depth: number;

  pinX: number;
  pinY: number;
  pinZ: number;

  members: Array<UDTO_Body> = new  Array<UDTO_Body>();

  constructor(properties?: any) {
    super();
    this.height = 0.0
    this.uniqueGuid = Tools.generateUUID();
    properties && this.override(properties);
  }

  addBody(body: UDTO_Body) {
    this.members.push(body);
  }

  public box(): Feature<Polygon> {
    return this.boxPolygon(this.width, this.height, this.depth);
  }

  getDisplayInfo():any {
    return {
      sourceGuid: this.sourceGuid,
      messageType: 'Platform',
      lat: `${this.lat}`,
      lng: `${this.lng}`,
      platformName: this.platformName,
      timeStamp: this.timeStamp,
      personId: this.personId
    };
  }
}

export class UDTO_Objective extends Location {
  uniqueGuid: string;
  name: string;
  type: Objective;
  note: string;

  constructor(properties?: any) {
    super();
    this.uniqueGuid = Tools.generateUUID();
    properties && this.override(properties);
  }

  getDisplayInfo(): IMessageView {
    return {
      sourceGuid: this.sourceGuid,
      uniqueGuid: this.uniqueGuid,
      messageType: 'Objective',
      lat: `${this.lat}`,
      lng: `${this.lng}`,
      user: this.personId,
      timeStamp: this.timeStamp,
      personId: this.personId,
      notes: `${this.type} - ${this.note || ''}`
    };
  }
}

export class UDTO_Observation extends Location {
  uniqueGuid: string;
  user: string;
  target: string;
  isTarget: boolean;

  range: number;

  constructor(properties?: any) {
    super();
    this.uniqueGuid = Tools.generateUUID();
    properties && this.override(properties);
  }

  public circle(): Feature<Polygon> {
    const radius = this.range;
    return this.circlePolygon(radius);
  }

  intersection(target: UDTO_Observation): Array<Feature<Point>> {
    const list: Array<Feature<Point>> = new Array<Feature<Point>>();

    // https://www.mathsisfun.com/algebra/trig-cosine-law.html

    // c2 = a2 + b2 − 2ab cos(C)

    const d = this.distance(target);
    const r1 = target.range;
    const r2 = this.range;

    if (d > r1 + r2) {
      return list;
    }

    const cosang = (r1 * r1 - r2 * r2 - d * d) / (-2.0 * r2 * d);
    const ang = this.toDeg(Math.acos(cosang));

    // 1  is right in KM
    //console.log(d);

    const brg = this.bearing(target);

    const b1 = brg + ang;
    const pt1 = this.destination(r2, b1);
    list.push(pt1);

    const b2 = brg - ang;
    const pt2 = this.destination(r2, b2);
    list.push(pt2);

    return list;
  }

  getDisplayInfo(): IMessageView {
    return {
      sourceGuid: this.sourceGuid,
      uniqueGuid: this.uniqueGuid,
      messageType: 'Observation',
      lat: `${this.lat}`,
      lng: `${this.lng}`,
      user: this.user || this.personId,
      timeStamp: this.timeStamp,
      personId: this.personId,
      notes: `${this.target} (${this.range}km)`
    };
  }
}
