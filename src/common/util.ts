import 'dotenv/config';
import { AxiosError } from 'axios';
import fs from 'fs-extra';
import path from 'path';
import type { PackageJson } from 'types-package-json';
import Keyv from 'keyv';
import L from './logger';

export const getCacheDir = (): string => {
  return process.env.CACHE_DIR || '/tmp';
};

export const cleanAxiosResponse = (err: AxiosError) => {
  const { response } = err;
  return {
    status: response?.status,
    headers: response?.headers,
    data: response?.data,
  };
};

let packageJsonCache: PackageJson | undefined;
export const packageJson = (): PackageJson => {
  if (packageJsonCache) return packageJsonCache;
  packageJsonCache = fs.readJSONSync(path.resolve(process.cwd(), `package.json`));
  return packageJsonCache as PackageJson;
};

export const getVersion = (): string => {
  const { COMMIT_SHA } = process.env;
  let { version } = packageJson();
  if (COMMIT_SHA) version = `${version}#${COMMIT_SHA.substring(0, 8)}`;
  return version;
};

export const range = (start: number, stop: number, step?: number): number[] => {
  const a = [start];
  let b = start;
  while (b < stop) {
    a.push((b += step || 1));
  }
  return a;
};

let keyv: Keyv | undefined;
export const getCache = (): Keyv => {
  const DB_FILE_PATH = `${getCacheDir()}/bow-and-scrape.sqlite`;
  if (!keyv) {
    const dbSize = fs.statSync(DB_FILE_PATH).size;
    if (dbSize > 100000000) {
      // TODO: Hack for corrupted DB prevention - delete when > 100MB
      fs.unlinkSync(DB_FILE_PATH);
    }
    keyv = new Keyv(`sqlite://${DB_FILE_PATH}`, {
      namespace: 'scrape',
    });
    keyv.on('error', (err) => L.error(err));
  }
  return keyv;
};

export const chunkArray = <T>(initArray: T[], size: number): T[][] => {
  return Array.from(new Array(Math.ceil(initArray.length / size)), (_, i) =>
    initArray.slice(i * size, i * size + size)
  );
};
