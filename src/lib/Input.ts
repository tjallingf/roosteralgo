import * as path from 'node:path';
import * as fs from 'node:fs';
import { DATA_DIR } from './constants';
import { glob } from 'glob';

class InputClass {
    #data;

    get(filename: string) {
        return this.#data[filename];
    }

    async loadDataset(datasetName) {
        const dir = this.#resolveDatasetDir(datasetName);

        // Throw an error if the directory does not exist
        if(!fs.existsSync(dir)) {
            throw new Error(`Dataset '${datasetName}' does not exist. Please create a directory.`);
        }

        const pattern = path.join(dir, '*.json').replaceAll('\\', '/');
        const filepaths = await glob.glob(pattern);
        
        // Read the file contents
        const data = {};
        filepaths.forEach(async fp => {
            const filename = path.parse(fp).name;
            const contents = JSON.parse(fs.readFileSync(fp, 'utf8'));

            if(Array.isArray(contents)) {
                $logger.info(`Found ${contents.length} ${filename}.`);
            }

            data[filename] = contents;
        })
        
        // Update the data
        this.#data = data;
    }

    #resolveDatasetDir(datasetName) {
        return path.resolve(DATA_DIR, datasetName);
    }
}

const Input = new InputClass();
export default Input;