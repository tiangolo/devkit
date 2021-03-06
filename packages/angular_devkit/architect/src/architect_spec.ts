/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { experimental, join, normalize } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import { concatMap, tap, toArray } from 'rxjs/operators';
import { BrowserTargetOptions } from '../test/browser';
import {
  Architect,
  BuilderCannotBeResolvedException,
  ConfigurationNotFoundException,
  TargetNotFoundException,
} from './architect';


describe('Architect', () => {
  const host = new NodeJsSyncHost();
  const root = normalize(__dirname);
  const workspace = new experimental.workspace.Workspace(root, host);
  let architect: Architect;
  const workspaceJson = {
    version: 1,
    newProjectRoot: 'src',
    projects: {
      app: {
        root: 'app',
        projectType: 'application',
        architect: {
          browser: {
            builder: '../test:browser',
            options: {
              browserOption: 1,
            },
            configurations: {
              prod: {
                optionalBrowserOption: false,
              },
            },
          },
          badBrowser: {
            builder: '../test:browser',
            options: {
              badBrowserOption: 1,
            },
          },
          karma: {
            builder: '../test:karma',
            options: {},
          },
        },
      },
    },
  };

  beforeAll((done) => workspace.loadWorkspaceFromJson(workspaceJson).pipe(
    concatMap(ws => new Architect(ws).loadArchitect()),
    tap(arch => architect = arch),
  ).subscribe(undefined, done.fail, done));

  it('works', (done) => {
    const targetSpec = { project: 'app', target: 'browser', configuration: 'prod' };
    architect.getBuilderConfiguration<BrowserTargetOptions>(targetSpec).pipe(
      tap(builderConfig => {
        expect(builderConfig.root).toBe(join(root, 'app'));
        expect(builderConfig.projectType).toBe('application');
        expect(builderConfig.builder).toBe('../test:browser');
        expect(builderConfig.options.browserOption).toBe(1);
        expect(builderConfig.options.optionalBrowserOption).toBe(false);
      }),
    ).subscribe(undefined, done.fail, done);
  });

  it('errors when missing target is used', (done) => {
    const targetSpec = { project: 'app', target: 'missing', configuration: 'prod' };
    architect.getBuilderConfiguration<BrowserTargetOptions>(targetSpec)
      .subscribe(undefined, (err: Error) => {
        expect(err).toEqual(jasmine.any(TargetNotFoundException));
        done();
      }, done.fail);
  });

  it('throws when missing configuration is used', (done) => {
    const targetSpec = { project: 'app', target: 'browser', configuration: 'missing' };
    architect.getBuilderConfiguration<BrowserTargetOptions>(targetSpec)
      .subscribe(undefined, (err: Error) => {
        expect(err).toEqual(jasmine.any(ConfigurationNotFoundException));
        done();
      }, done.fail);
  });

  it('runs targets', (done) => {
    const targetSpec = { project: 'app', target: 'browser', configuration: 'prod' };
    architect.getBuilderConfiguration<BrowserTargetOptions>(targetSpec).pipe(
      concatMap((builderConfig) => architect.run(builderConfig)),
      toArray(),
      tap(events => {
        expect(events.length).toBe(3);
        expect(events[0].success).toBe(true);
        expect(events[1].success).toBe(false);
        expect(events[2].success).toBe(true);
      }),
    ).subscribe(undefined, done.fail, done);
  });

  it('errors when builder cannot be resolved', (done) => {
    const targetSpec = { project: 'app', target: 'karma' };
    architect.getBuilderConfiguration<BrowserTargetOptions>(targetSpec).pipe(
      concatMap((builderConfig) => architect.run(builderConfig)),
    ).subscribe(undefined, (err: Error) => {
      expect(err).toEqual(jasmine.any(BuilderCannotBeResolvedException));
      done();
    }, done.fail);
  });

  it('errors when builder options fail validation', (done) => {
    const targetSpec = { project: 'app', target: 'badBrowser' };
    architect.getBuilderConfiguration<BrowserTargetOptions>(targetSpec).pipe(
      concatMap((builderConfig) => architect.run(builderConfig)),
    ).subscribe(undefined, (err: Error) => {
      expect(err).toEqual(jasmine.any(experimental.workspace.SchemaValidationException));
      done();
    }, done.fail);
  });
});
