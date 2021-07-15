// Credit to https://gist.github.com/sasxa
// Imports
import { Injectable, EventEmitter } from '@angular/core';

// https://scotch.io/tutorials/angular-2-http-requests-with-observables

@Injectable()
export class EmitterService {
  // Event store
  private static _emitters: { [ID: string]: EventEmitter<any> } = {};
  // Set a new event in the store with a given ID
  // as key
  static get(ID: string): EventEmitter<any> {
    if (!this._emitters[ID]) {
      const source = new EventEmitter();
      this._emitters[ID] = source;
    }
    return this._emitters[ID];
  }

  static processCommands(target) {
    const cmd = EmitterService.get('COMMAND');

    cmd.subscribe(cmd => {
      const { command, args, source } = cmd;
      const name = `cmd${command}`;

      const funct = target[name];
      if (funct) {
        funct.call(target, args, source);
        // Toast.success(name);
      } else {
        // Toast.error(name, 'command not found');
      }
    });
    return cmd;
  }

  static broadcastCommand(source, command: string, args: any= null, callback: any= null) {
    const cmd = {
      command,
      args,
      source
    };
    setTimeout(function() {
      EmitterService.get('COMMAND').emit(cmd);
      callback && callback();
    }, 10);
  }



  static registerCommand(source, command: string, func) {
    const name = `cmd${command}`;
    source[name] = func;
  }

  static displayToast(source, funct) {
    EmitterService.get('SHOWERROR').subscribe(item => {
      funct.call(source, 'error', item.title, item.message);
    });

    EmitterService.get('SHOWWARNING').subscribe(item => {
      funct.call(source, 'warning', item.title, item.message);
    });

    EmitterService.get('SHOWINFO').subscribe(item => {
      funct.call(source, 'info', item.title, item.message);
    });

    EmitterService.get('SHOWSUCCESS').subscribe(item => {
      funct.call(source, 'success', item.title, item.message);
    });
  }

}

class PopupToast {
  error(message: string, title?: string) {
    const toast = {
      title: title || '',
      message
    };
    EmitterService.get('SHOWERROR').emit(toast);
  }
  warning(message: string, title?: string) {
    const toast = {
      title: title || '',
      message
    };
    EmitterService.get('SHOWWARNING').emit(toast);
  }
  success(message: string, title?: string) {
    const toast = {
      title: title || '',
      message
    };
    EmitterService.get('SHOWSUCCESS').emit(toast);
  }
  info(message: string, title?: string) {
    const toast = {
      title: title || '',
      message
    };
    EmitterService.get('SHOWINFO').emit(toast);
  }
}

export const Toast: PopupToast = new PopupToast();
