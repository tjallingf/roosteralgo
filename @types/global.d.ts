import Logger from '../src/lib/Logger';
import Config from '../src/lib/Config';

declare global {   
    var $logger: typeof Logger;
    var $config: typeof Config;
}

export {};