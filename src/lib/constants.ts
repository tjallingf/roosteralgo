import * as path from 'path';

const ROOT_DIR = path.dirname(path.dirname(__dirname));
const DATA_DIR = path.resolve(ROOT_DIR, './data');

export { ROOT_DIR, DATA_DIR };