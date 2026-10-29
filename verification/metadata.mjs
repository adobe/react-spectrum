/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {isAbsolute, join} from 'node:path';

export const packageNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function repositoryPath(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !isAbsolute(value) &&
    !value.includes('\\') &&
    !value.split('/').some(part => !part || part === '.' || part === '..')
  );
}

// A marker makes packages discoverable without treating harness directories as targets.
// Retain review-only packages for compatibility with the original status command.
export function discoverPackages(root) {
  return readdirSync(join(root, 'verification'), {withFileTypes: true})
    .filter(
      entry =>
        entry.isDirectory() &&
        packageNamePattern.test(entry.name) &&
        ['verification.json', 'review.json'].some(file =>
          existsSync(join(root, 'verification', entry.name, file))
        )
    )
    .map(entry => entry.name)
    .sort();
}

export function readPackage(root, name) {
  if (!packageNamePattern.test(name)) throw new Error('Invalid package name.');
  let metadata = JSON.parse(
    readFileSync(join(root, 'verification', name, 'verification.json'), 'utf8')
  );
  let require = (condition, message) => {
    if (!condition) throw new Error(`${name}: ${message}`);
  };
  let text = value => typeof value === 'string' && value.trim().length > 0;
  let strings = values => Array.isArray(values) && values.length > 0 && values.every(text);
  let unique = values => new Set(values).size === values.length;
  require(metadata.schemaVersion === 1 &&
    metadata.name === name &&
    text(metadata.description), 'Invalid package identity.');
  require(Array.isArray(metadata.properties) &&
    metadata.properties.length > 0, 'Properties are required.');
  require(metadata.properties.every(
    p => p && /^[A-Za-z][A-Za-z0-9]*$/.test(p.id) && text(p.contract)
  ), 'Invalid property.');
  let ids = metadata.properties.map(p => p.id);
  require(unique(ids), 'Duplicate property ID.');
  let properties = values =>
    strings(values) && unique(values) && values.every(id => ids.includes(id));
  require(text(metadata.bounds) &&
    strings(metadata.assumptions) &&
    strings(metadata.exclusions), 'Scope, assumptions, and exclusions are required.');
  require(Array.isArray(metadata.sources) &&
    metadata.sources.length > 0 &&
    metadata.sources.every(
      source =>
        source &&
        repositoryPath(source.path) &&
        strings(source.functions) &&
        properties(source.properties) &&
        text(source.mapping)
    ), 'Invalid source mapping.');
  require(unique(metadata.sources.map(source => source.path)), 'Duplicate source path.');
  require(strings(metadata.verificationFiles) &&
    metadata.verificationFiles.every(repositoryPath) &&
    unique(metadata.verificationFiles), 'Invalid verification files.');
  require(metadata.sources.every(
    source => !metadata.verificationFiles.includes(source.path)
  ), 'Source and verification files must be distinct.');
  require(Array.isArray(metadata.checks) && metadata.checks.length > 0, 'Checks are required.');
  for (let check of metadata.checks) {
    require(check &&
      packageNamePattern.test(check.id) &&
      properties(check.properties), 'Invalid check identity or properties.');
    require(Number.isSafeInteger(check.timeoutMs) &&
      check.timeoutMs > 0 &&
      check.timeoutMs <= 3600000, `Invalid timeout for ${check.id}.`);
    require(['tla-ts', 'vitest', 'jest'].includes(
      check.kind
    ), `Unsupported check kind: ${check.kind}`);
    let files =
      check.kind === 'tla-ts' ? [check.model, check.config] : [check.testFile, check.config];
    require(files.every(
      file => repositoryPath(file) && metadata.verificationFiles.includes(file)
    ), `Register all files for ${check.id} in verificationFiles.`);
    if (check.kind === 'vitest')
      require(text(check.project) &&
        check.browser === 'chromium', 'This adapter currently supports Chromium projects.');
    if (check.testNamePatterns !== undefined) {
      require(check.kind !== 'tla-ts' &&
        check.testNamePatterns &&
        typeof check.testNamePatterns === 'object', 'Invalid test filters.');
      require(Object.keys(check.testNamePatterns).length === check.properties.length &&
        check.properties.every(id =>
          text(check.testNamePatterns[id])
        ), 'Supply a test filter for every check property.');
      for (let pattern of Object.values(check.testNamePatterns)) new RegExp(pattern);
    }
  }
  require(unique(metadata.checks.map(check => check.id)), 'Duplicate check ID.');
  if (metadata.mutationEnvironment !== undefined)
    require(strings(metadata.mutationEnvironment) &&
      metadata.mutationEnvironment.every(name =>
        /^[A-Z][A-Z0-9_]*$/.test(name)
      ), 'Invalid mutation environment names.');
  require(ids.every(
    id =>
      metadata.checks.some(check => check.properties.includes(id)) &&
      metadata.sources.some(source => source.properties.includes(id))
  ), 'Every property needs source coverage and a check.');
  if (metadata.checks.some(check => check.kind === 'tla-ts')) {
    let tool = metadata.tools?.['tla-ts'];
    require(tool &&
      text(tool.version) &&
      /^[A-Z][A-Z0-9_]*$/.test(tool.directoryEnv) &&
      /^[a-f0-9]{64}$/.test(tool.sha256) &&
      text(
        tool.acquisition
      ), 'tla-ts requires a pinned runtime checksum and acquisition instructions.');
  }
  let registered = path => repositoryPath(path) && metadata.verificationFiles.includes(path);
  let environment = value => typeof value === 'string' && /^[A-Z][A-Z0-9_]*$/.test(value);
  if (metadata.replay !== undefined) {
    let replay = metadata.replay;
    require(replay &&
      text(replay.adapterId) &&
      registered(replay.adapter) &&
      registered(replay.testFile) &&
      text(replay.testNamePattern), 'Invalid replay adapter.');
    require(metadata.checks.some(
      check => check.id === replay.check && check.kind === 'vitest'
    ), 'Replay requires a registered Vitest check.');
    require(environment(replay.traceEnvironment) &&
      environment(replay.resultEnvironment) &&
      replay.traceEnvironment !== replay.resultEnvironment, 'Invalid replay environment.');
    new RegExp(replay.testNamePattern);
  }
  if (metadata.validation !== undefined) {
    let validation = metadata.validation;
    require(validation &&
      metadata.checks.some(check => check.id === validation.check && check.kind === 'vitest') &&
      metadata.sources.some(
        source => source.path === validation.source
      ), 'Invalid validation check/source.');
    require(metadata.mutationEnvironment?.includes(validation.environment) &&
      environment(validation.receiptEnvironment) &&
      validation.environment !== validation.receiptEnvironment, 'Invalid validation environment.');
    require(Array.isArray(validation.mutations) &&
      validation.mutations.length > 0 &&
      validation.mutations.every(
        control =>
          control &&
          packageNamePattern.test(control.id) &&
          ids.includes(control.property) &&
          text(control.testNamePattern) &&
          text(control.failureMarker)
      ), 'Invalid mutation controls.');
    require(unique(validation.mutations.map(control => control.id)), 'Duplicate mutation control.');
    for (let control of validation.mutations) {
      if (control.replayActions !== undefined)
        require(metadata.replay &&
          strings(control.replayActions) &&
          control.replayActions.length <= 8, 'Invalid replay mutation actions.');
      require(metadata.checks
        .find(check => check.id === validation.check)
        .properties.includes(control.property), 'Mutation property is outside check coverage.');
      new RegExp(control.testNamePattern);
    }
  }
  return metadata;
}

export function coveredFiles(metadata) {
  return {
    sourceFiles: metadata.sources.map(source => source.path),
    verificationFiles: [
      ...new Set([`verification/${metadata.name}/verification.json`, ...metadata.verificationFiles])
    ]
  };
}

export function selectChecks(metadata, property) {
  if (property && !metadata.properties.some(item => item.id === property))
    throw new Error(`Unknown property: ${property}`);
  return metadata.checks
    .filter(check => !property || check.properties.includes(property))
    .map(check => ({
      ...check,
      requestedProperties: property ? [property] : check.properties,
      testNamePattern: property ? check.testNamePatterns?.[property] : undefined
    }));
}
