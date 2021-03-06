/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { fromPromise } from 'rxjs/observable/fromPromise';
import { concatMap, take, tap } from 'rxjs/operators';
import { DevServerBuilderOptions } from '../../src';
import {
  TestProjectHost,
  browserWorkspaceTarget,
  devServerWorkspaceTarget,
  request,
  runTargetSpec,
  workspaceRoot,
} from '../utils';


describe('Dev Server Builder serve path', () => {
  const host = new TestProjectHost(workspaceRoot);

  beforeEach(done => host.initialize().subscribe(undefined, done.fail, done));
  afterEach(done => host.restore().subscribe(undefined, done.fail, done));

  // TODO: review this test, it seems to pass with or without the servePath.
  it('works', (done) => {
    const overrides: Partial<DevServerBuilderOptions> = { servePath: 'test/' };

    runTargetSpec(host, [browserWorkspaceTarget, devServerWorkspaceTarget], overrides).pipe(
      tap((buildEvent) => expect(buildEvent.success).toBe(true)),
      concatMap(() => fromPromise(request('http://localhost:4200/test/'))),
      tap(response => expect(response).toContain('<title>HelloWorldApp</title>')),
      concatMap(() => fromPromise(request('http://localhost:4200/test/abc/'))),
      tap(response => expect(response).toContain('<title>HelloWorldApp</title>')),
      take(1),
    ).subscribe(undefined, done.fail, done);
  }, 30000);
});
