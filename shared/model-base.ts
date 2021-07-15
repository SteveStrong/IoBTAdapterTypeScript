
// import { pull, get } from 'lodash';
const _ = require('lodash');
import { Subject } from 'rxjs';
import { Tools } from './foTools';

export interface ModelBaseProperty {
    getter: Function;
    setter: Function;
}

export interface ModelBaseListProperty extends ModelBaseProperty {
    push: Function;
    remove: Function;
    labelForAdd: Function;
    defaultDataForAdd: Function;
}

export interface ModelBaseEnumProperty extends ModelBaseProperty {
    push: Function;
    clear: Function;
    remove: Function;
    getEnumValues: () => Subject<string[]>;
    mutuallyExclusive: Function;
    minRequiredSelections: Function;
}

export class ModelBase {
    [key: string]: any;
    override(data: any) {
        if (data) {
            Object.keys(data).forEach((key) => {
                Object.defineProperty(this, key, {
                    value: data[key],
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            });
        }
    }

    getPropertyValue(object: any, dataToRetrieve: string): any {
        return _.get(object, dataToRetrieve);
    }

    getProperty(propertyName: string, asArray?: boolean): ModelBaseProperty {
        return {
            getter: () => {
                const result = this.getPropertyValue(this, propertyName);
                return asArray && result ? result.join(' ') : result;
            },
            setter: (value: any): [string, any] => {
                const result = asArray ? [value] : value;
                Object.defineProperty(this, propertyName, {
                    value: result,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });

                return [propertyName, this];
            }
        };
    }

    getPropertyAsList(propertyName: string, defaultData?: any, defaultLabel?: string): ModelBaseListProperty {
        return {
            getter: () => {
                const result = this.getPropertyValue(this, propertyName);
                return result ? result : [];
            },
            setter: (value: any) => {
                const result = value;
                Object.defineProperty(this, propertyName, {
                    value: result,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            },
            push: (value: any) => {
                const result = this.getPropertyValue(this, propertyName);
                result.push(value);
                Object.defineProperty(this, propertyName, {
                    value: result,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            },
            remove: (value: any) => {
                const result = this.getPropertyValue(this, propertyName);
                _.pull(result, value);
                Object.defineProperty(this, propertyName, {
                    value: result,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            },
            labelForAdd: () => {
                return defaultLabel || 'Add Item';
            },
            defaultDataForAdd: () => {
                const list = this.getPropertyValue(this, propertyName);
                return defaultData || (list.length > 0 && Object.assign({}, list[0])) || {};
            }
        };
    }

    getPropertyAsEnumList(propertyName: string, list: [], isME: boolean, minReq: number, defaultData?: any, defaultLabel?: string): ModelBaseEnumProperty {
        return {
            getter: () => {
                const result = this.getPropertyValue(this, propertyName);
                return result ? result : isME ? '' : [];
            },
            setter: (value: any) => {
                let result = value;
                if (!Tools.isEmpty(value) && Tools.isArray(value) && isME) {
                    result = value[0];
                }
                Object.defineProperty(this, propertyName, {
                    value: result,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            },
            push: (value: any) => {
                let result = this.getPropertyValue(this, propertyName);
                if (isME) {
                    result = value;
                } else {
                    result.push(value);
                }
                Object.defineProperty(this, propertyName, {
                    value: result,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            },
            clear: () => {
                const result = [] as any[];
                Object.defineProperty(this, propertyName, {
                    value: result,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            },
            remove: (value: any) => {
                const result = this.getPropertyValue(this, propertyName);
                _.pull(result, value);
                Object.defineProperty(this, propertyName, {
                    value: result,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            },
            getEnumValues: () => {
                const result = new Subject<string[]>();
                setTimeout(() => {
                    result.next(list);
                    result.complete();
                }, 10);
                return result;
            },
            mutuallyExclusive: () => {
                return isME;
            },
            minRequiredSelections: () => {
                return minReq;
            }
        };
    }

    removeUndefined() {
        for (let key in this) {
            if (this[key] === undefined) {
                delete this[key];
            }
        }
        return this;
    }

    get myType(): string {
        const comp: any = this.constructor;
        return comp.name;
    }
    set myType(ignore: string) {}

    toJSON(): any {
        // Object.assign:  copy the values of all of the enumerable own properties from one or more source objects to a target object. Returns the target object.
        return Object.assign({}, this);
    }
}

export interface IHashAny {
    [key: string]: any;
}



export interface IHashStringNumber {
    readonly [key: string]: string | number;
}

export interface IHashString {
    readonly [key: string]: string;
}

export interface IHashNumber {
    readonly [key: string]: number;
}

export interface IListOfValueItem {
    code: string | undefined;
    description: string;
    other?: any;
}

export class ModelBaseEnumPropertyDefault {
    getter = Tools.doNothing;
    setter = Tools.doNothing;
    push = Tools.doNothing;
    clear = Tools.doNothing;
    remove = Tools.doNothing;
    getEnumValues = () => new Subject<string[]>();
    mutuallyExclusive = Tools.doNothing;
    minRequiredSelections = Tools.doNothing;
}
