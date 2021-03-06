// tslint:disable
// TODO: cleanup this file, it's copied as is from Angular CLI.

import * as path from 'path';

export const ngAppResolve = (resolvePath: string): string => {
  return path.resolve(process.cwd(), resolvePath);
};

const webpackOutputOptions = {
  colors: true,
  hash: true, // required by custom stat output
  timings: true, // required by custom stat output
  chunks: true, // required by custom stat output
  chunkModules: false,
  children: false, // listing all children is very noisy in AOT and hides warnings/errors
  modules: false,
  reasons: false,
  warnings: true,
  errors: true,
  assets: true, // required by custom stat output
  version: false,
  errorDetails: false,
  moduleTrace: false,
};

const verboseWebpackOutputOptions = {
  children: true,
  assets: true,
  version: true,
  reasons: true,
  chunkModules: false, // TODO: set to true when console to file output is fixed
  errorDetails: true,
  moduleTrace: true,
};

export function getWebpackStatsConfig(verbose = false) {
  return verbose
    ? Object.assign(webpackOutputOptions, verboseWebpackOutputOptions)
    : webpackOutputOptions;
}

export interface ExtraEntry {
  input: string;
  output?: string;
  lazy?: boolean;
  path?: string;
  entry?: string;
}

// Filter extra entries out of a arran of extraEntries
export function lazyChunksFilter(extraEntries: ExtraEntry[]) {
  return extraEntries
    .filter(extraEntry => extraEntry.lazy)
    .map(extraEntry => extraEntry.entry);
}

// convert all extra entries into the object representation, fill in defaults
export function extraEntryParser(
  extraEntries: (string | ExtraEntry)[],
  appRoot: string,
  defaultEntry: string
): ExtraEntry[] {
  return extraEntries
    .map((extraEntry: string | ExtraEntry) =>
      typeof extraEntry === 'string' ? { input: extraEntry } : extraEntry)
    .map((extraEntry: ExtraEntry) => {
      extraEntry.path = path.resolve(appRoot, extraEntry.input);
      if (extraEntry.output) {
        extraEntry.entry = extraEntry.output.replace(/\.(js|css)$/i, '');
      } else if (extraEntry.lazy) {
        extraEntry.entry = extraEntry.input.replace(/\.(js|css|scss|sass|less|styl)$/i, '');
      } else {
        extraEntry.entry = defaultEntry;
      }
      return extraEntry;
    });
}

export interface HashFormat {
  chunk: string;
  extract: string;
  file: string;
  script: string;
}

export function getOutputHashFormat(option: string, length = 20): HashFormat {
  /* tslint:disable:max-line-length */
  const hashFormats: { [option: string]: HashFormat } = {
    none:    { chunk: '',                       extract: '',                         file: ''                 , script: '' },
    media:   { chunk: '',                       extract: '',                         file: `.[hash:${length}]`, script: ''  },
    bundles: { chunk: `.[chunkhash:${length}]`, extract: `.[contenthash:${length}]`, file: ''                 , script: `.[hash:${length}]`  },
    all:     { chunk: `.[chunkhash:${length}]`, extract: `.[contenthash:${length}]`, file: `.[hash:${length}]`, script: `.[hash:${length}]`  },
  };
  /* tslint:enable:max-line-length */
  return hashFormats[option] || hashFormats['none'];
}

export interface AssetPattern {
  glob: string;
  input?: string;
  output?: string;
  allowOutsideOutDir?: boolean;
}
