/* global platypus */
import './styles.css';
import {Game} from 'platypus';
import unpack from './spritesheets.js';

const
    packageData = require('../package.json'),
    config = {
        entities: {},
        levels: {},
        spriteSheets: {},
        atlases: {},
        skeletons: {}
    },
    flatten = {
        entities: true,
        scenes: true
    },
    importJS = (r, config) => r.keys().forEach((key) => {
        const
            arr = key.split('/'),
            last = arr.length - 1,
            file = arr[last],
            lastDot = file.lastIndexOf('.'),
            fileName = file.substring(0, lastDot),
            fileType = file.substring(lastDot + 1).toLowerCase(),
            result = fileType === 'js' ? r(key).default : fileType === 'json' ? r(key) : null;
        let fullName = '',
            props = config;
        
        for (let i = 0; i < last; i++) {
            if (arr[i] !== '.') {
                if (!props[arr[i]]) {
                    props[arr[i]] = {};
                }

                props = props[arr[i]];

                if (flatten[arr[i]]) {
                    for (let j = i + 1; j < arr.length - 1; j++) {
                        fullName += `${arr[j]}-`;
                    }
                    fullName += fileName;
                    break;
                }
            }
        }

        // We have a duplicate
        if (props[fileName]) {
            if (Array.isArray(props[fileName])) {
                props[fileName].push(result);
            } else {
                props[fileName] = [
                    props[fileName],
                    result
                ];
            }                
        } else {
            props[fileName] = result;
        }

        if (fullName && fullName !== fileName) {
            props[fullName] = result;
        }
    }),
    importTEXT = (r, config) => r.keys().forEach((key) => {
        const
            arr = key.split('/'),
            last = arr[arr.length - 1];
        
        config[last.substring(0, last.length - 6)] = r(key).default;
    });

// Base configuration
importJS(require.context(
    "./config/", // context folder
    true, // include subdirectories
    /.*\.(?:js|json)/ // RegExp
  ), config);

// Sprite Sheets
importJS(require.context(
    "../assets/images/", // context folder
    true, // include subdirectories
    /.*\.json/ // RegExp
  ), config.spriteSheets);
unpack(config.spriteSheets, 'assets/images/');

// levels
importJS(require.context(
    "../assets/levels/", // context folder
    true, // include subdirectories
    /.*\.json/ // RegExp
  ), config.levels);

  // spine skeleton files
importJS(require.context(
    "../assets/spine/", // context folder
    true, // include subdirectories
    /.*\.json/ // RegExp
  ), config.skeletons);

// spine atlas files
importTEXT(require.context(
    "../assets/spine/", // context folder
    true, // include subdirectories
    /.*\.atlas/ // RegExp
  ), config.atlases);

const game = new Game(config, {
    canvasId: 'stage',
    display: {
        aspectRatio: "3:7-7:3",
        backgroundColor: 0x101010,
        clearView: true
    },
    name: packageData.name,
    version: packageData.version,
    dev: true
}, () => {
    platypus.debug.log('game loaded');
});

game.loadScene('title-scene');