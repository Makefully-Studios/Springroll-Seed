/* global platypus */
import './styles.css';
import {Game} from 'platypus';
import unpack from './spritesheets.js';

const
    packageData = require('../package.json'),
    config = {
        entities: {},
        levels: {},
        spriteSheets: {}
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

const game = new Game(config, {
    canvasId: 'stage',
    display: {
        aspectRatio: "3:7-7:3",
        backgroundColor: 0x101010,
        clearView: true
    },
    name: packageData.name,
    version: packageData.version,
    dev: PRODUCTION === false,
    features: {
        sfx: true,
        vo: true,
        music: true,
        sound: true,
        captions: true,
        soundVolume: true,
        musicVolume: true,
        sfxVolume: true,
        voVolume: true
    }
}, () => {
    platypus.debug.log('game loaded');
});

game.loadScene('title-scene');