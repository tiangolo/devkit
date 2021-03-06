/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { join, normalize, virtualFs } from '@angular-devkit/core';
import { tap } from 'rxjs/operators';
import { TestProjectHost, browserWorkspaceTarget, runTargetSpec, workspaceRoot } from '../utils';


describe('Browser Builder', () => {
  const host = new TestProjectHost(workspaceRoot);
  const outputPath = normalize('dist');

  beforeEach(done => host.initialize().subscribe(undefined, done.fail, done));
  afterEach(done => host.restore().subscribe(undefined, done.fail, done));

  it('works', (done) => {
    const overrides = { aot: true };

    runTargetSpec(host, browserWorkspaceTarget, overrides).pipe(
      tap((buildEvent) => expect(buildEvent.success).toBe(true)),
      tap(() => {
        const fileName = join(outputPath, 'main.js');
        const content = virtualFs.fileBufferToString(host.asSync().read(normalize(fileName)));
        expect(content).toMatch(/platformBrowser.*bootstrapModuleFactory.*AppModuleNgFactory/);
      }),
    ).subscribe(undefined, done.fail, done);
  }, 30000);
});
