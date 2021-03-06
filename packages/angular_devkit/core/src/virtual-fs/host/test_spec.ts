/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable:no-implicit-dependencies
// tslint:disable:non-null-operator
import { TestHost } from './test';


// Yes, we realize the irony of testing a test host.
describe('TestHost', () => {

  it('can list files', () => {
    const files = {
      '/x/y/z': '',
      '/a': '',
      '/h': '',
      '/x/y/b': '',
    };

    const host = new TestHost(files);
    expect(host.files.sort() as string[]).toEqual(Object.keys(files).sort());
  });

});
