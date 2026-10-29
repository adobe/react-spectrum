/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain
 * a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {inspectPackage, runStatus} from '../status.mjs';
import {join} from 'node:path';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {test} from 'node:test';
import {tmpdir} from 'node:os';

function fixture(t) {
  let root = mkdtempSync(join(tmpdir(), 'verification-status-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  let directory = join(root, 'verification', 'example');
  mkdirSync(directory, {recursive: true});
  writeFileSync(join(root, 'source.ts'), 'original source\n');
  writeFileSync(join(directory, 'Model.tla'), 'original model\n');
  writeFileSync(
    join(directory, 'verification.json'),
    JSON.stringify({
      schemaVersion: 1,
      name: 'example',
      description: 'Example',
      properties: [{id: 'Safety', contract: 'Safety contract.'}],
      sources: [
        {
          path: 'source.ts',
          functions: ['operation'],
          properties: ['Safety'],
          mapping: 'Operation to step.'
        }
      ],
      bounds: 'Two steps.',
      assumptions: ['Sequential.'],
      exclusions: ['Concurrency.'],
      verificationFiles: ['verification/example/Model.tla'],
      tools: {
        tlc: {
          version: '1.7.4',
          jarEnv: 'TLA2TOOLS_JAR',
          sha256: 'a'.repeat(64),
          minimumJavaVersion: 11,
          acquisition: 'External setup.'
        }
      },
      checks: [
        {
          id: 'model',
          kind: 'tlc',
          properties: ['Safety'],
          model: 'verification/example/Model.tla',
          config: 'verification/example/Model.tla',
          timeoutMs: 1000
        }
      ]
    })
  );
  let review = {
    schemaVersion: 1,
    reviewedAt: '2026-10-21',
    reviewedCommit: 'a'.repeat(40),
    note: 'Reviewed the source correspondence.',
    sourceFiles: {'source.ts': hash(join(root, 'source.ts'))},
    verificationFiles: {
      'verification/example/Model.tla': hash(join(directory, 'Model.tla')),
      'verification/example/verification.json': hash(join(directory, 'verification.json'))
    }
  };
  let manifest = join(directory, 'review.json');
  let save = () => writeFileSync(manifest, JSON.stringify(review));
  save();
  return {root, directory, review, manifest, save};
}

function hash(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

test('matching recorded files do not imply verification ran', t => {
  let {root} = fixture(t);
  let output;
  assert.equal(
    runStatus(['--json'], root, text => (output = text)),
    0
  );
  let result = JSON.parse(output);
  assert.equal(result.verification, 'not-run');
  assert.equal(result.packages[0].status, 'matches-record');
});

test('detects working-tree source edits and never refreshes the record', t => {
  let {root, manifest} = fixture(t);
  let before = readFileSync(manifest, 'utf8');
  writeFileSync(join(root, 'source.ts'), 'changed source\n');
  let result = inspectPackage(root, 'example');
  assert.equal(result.status, 'needs-review');
  assert.equal(result.changes[0].group, 'sourceFiles');
  assert.equal(result.changes[0].path, 'source.ts');
  assert.equal(
    runStatus([], root, () => {}),
    1
  );
  assert.equal(readFileSync(manifest, 'utf8'), before);
});

test('model drift is reported independently of source drift', t => {
  let {root, directory} = fixture(t);
  writeFileSync(join(directory, 'Model.tla'), 'changed model\n');
  let {changes} = inspectPackage(root, 'example');
  assert.equal(changes.length, 1);
  assert.equal(changes[0].group, 'verificationFiles');
});

test('deleted covered files require review', t => {
  let {root} = fixture(t);
  rmSync(join(root, 'source.ts'));
  let result = inspectPackage(root, 'example');
  assert.equal(result.status, 'needs-review');
  assert.equal(result.changes[0].status, 'missing');
});

test('a package without a review record is visible', t => {
  let {root, manifest} = fixture(t);
  rmSync(manifest);
  let output;
  assert.equal(
    runStatus(['--json'], root, text => (output = text)),
    1
  );
  assert.equal(JSON.parse(output).packages[0].status, 'not-recorded');
});

test('invalid metadata is an error rather than a matching baseline', t => {
  let {root, manifest, review, save} = fixture(t);
  review.sourceFiles['source.ts'] = 'not a hash';
  save();
  assert.equal(
    runStatus([], root, () => {}),
    2
  );
  writeFileSync(manifest, '{broken JSON');
  assert.equal(
    runStatus([], root, () => {}),
    2
  );
});

test('records cannot point outside the repository or omit a source group', t => {
  let {root, review, save} = fixture(t);
  review.sourceFiles = {'../outside.ts': 'a'.repeat(64)};
  save();
  assert.equal(inspectPackage(root, 'example').status, 'error');
  review.sourceFiles = {};
  save();
  assert.equal(inspectPackage(root, 'example').status, 'error');
});

test('selects one package and rejects unknown names/options', t => {
  let {root} = fixture(t);
  mkdirSync(join(root, 'verification', 'unreviewed'));
  let metadata = JSON.parse(
    readFileSync(join(root, 'verification/example/verification.json'), 'utf8')
  );
  metadata.name = 'unreviewed';
  writeFileSync(
    join(root, 'verification', 'unreviewed', 'verification.json'),
    JSON.stringify(metadata)
  );
  assert.equal(
    runStatus([], root, () => {}),
    1
  );
  assert.equal(
    runStatus(['example'], root, () => {}),
    0
  );
  assert.equal(
    runStatus(['unknown'], root, () => {}),
    2
  );
  assert.equal(
    runStatus(['../outside'], root, () => {}),
    2
  );
  assert.equal(
    runStatus(['--update'], root, () => {}),
    2
  );
});
