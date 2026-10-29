/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import {closeSync, openSync, writeSync} from 'node:fs';
import {spawn} from 'node:child_process';

// Write complete logs to disk, retaining only a bounded tail for diagnostics.
// A separate process group lets timeouts stop Yarn's child runners as well.
export function runProcess(command, args, {cwd, env = process.env, timeoutMs, log, signal} = {}) {
  return new Promise(resolve => {
    let fd = openSync(log, 'wx');
    let started = Date.now();
    let output = '';
    let error;
    let timedOut = false;
    let interrupted = false;
    let killTimer;
    let child = spawn(command, args, {
      cwd,
      env,
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let kill = signal => {
      try {
        if (process.platform === 'win32') child.kill(signal);
        else if (child.pid) process.kill(-child.pid, signal);
      } catch (failure) {
        if (failure.code !== 'ESRCH') error = failure.message;
      }
    };
    let stop = () => {
      kill('SIGTERM');
      killTimer ??= setTimeout(() => kill('SIGKILL'), 1000);
    };
    let abort = () => {
      interrupted = true;
      stop();
    };
    let timer = setTimeout(() => {
      timedOut = true;
      stop();
    }, timeoutMs);
    let record = chunk => {
      try {
        writeSync(fd, chunk);
        output = (output + chunk.toString()).slice(-65536);
      } catch (failure) {
        error = failure.message;
        stop();
      }
    };
    child.stdout.on('data', record);
    child.stderr.on('data', record);
    child.on('error', failure => {
      error = failure.message;
    });
    child.on('close', (code, exitSignal) => {
      clearTimeout(timer);
      clearTimeout(killTimer);
      signal?.removeEventListener('abort', abort);
      closeSync(fd);
      resolve({
        code,
        signal: exitSignal,
        error,
        timedOut,
        interrupted,
        durationMs: Date.now() - started,
        output
      });
    });
    signal?.addEventListener('abort', abort, {once: true});
    if (signal?.aborted) abort();
  });
}
