const
    createKey = function (path, projectSrc) {
        return path.replace(projectSrc, '').replace('.json', '').replace('.png', '');
    },
    createFramesArray = function (frame, base) {
        const
            fw = frame.width,
            fh = frame.height,
            rx = frame.regX || 0,
            ry = frame.regY || 0,

            // Subtract the size of a frame so that margin slivers aren't returned as frames.
            w = base.sourceSize.w - fw,
            h = base.sourceSize.h - fh,

            frames = [];

        for (let y = 0; y <= h; y += fh) {
            for (let x = 0; x <= w; x += fw) {
                frames.push([x, y, fw, fh, 0, rx, ry]);
            }
        }

        return frames;
    },
    createDefault = function (frame, img) {
        return {
            images: [img],
            frames: [[frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h, 0, Math.floor(frame.frame.w / 2), Math.floor(frame.frame.h / 2)]],
            animations: {
                "default": 0
            }
        };
    },
    updateImageIndex = function (frames, fromIndex, toIndex) {
        let i = frames.length;
        
        while (i--) {
            if (frames[i][4] === fromIndex) {
                frames[i][4] = toIndex;
            } else if (frames[i][4] > fromIndex) {
                frames[i][4] -= 1;
            }
        }
    },
    reposition = function (ss, img, s, key) {
        let i = ss.images.length,
            str = '',
            imageIndex = 0;

        while (i--) {
            if (createKey(ss.images[i]) === key) {
                imageIndex = i;
                break;
            }
        }

        if (!Array.isArray(ss.frames)) {
            ss.frames = createFramesArray(ss.frames, s);
        }

        for (i = 0; i < ss.frames.length; i++) {
            const
                f = ss.frames[i];

            if (f[4] === imageIndex) {
                if (s.trimmed) {
                    if (f[0] < s.spriteSourceSize.x) {
                        f[2] -= s.spriteSourceSize.x - f[0];
                        f[5] -= s.spriteSourceSize.x - f[0];
                        f[0] = 0;
                    } else {
                        f[0] -= s.spriteSourceSize.x;
                    }

                    if (f[0] + f[2] > s.spriteSourceSize.w) {
                        f[2] = s.spriteSourceSize.w - f[0];
                    }

                    if (f[1] < s.spriteSourceSize.y) {
                        f[3] -= s.spriteSourceSize.y - f[1];
                        f[6] -= s.spriteSourceSize.y - f[1];
                        f[1] = 0;
                    } else {
                        f[1] -= s.spriteSourceSize.y;
                    }

                    if (f[1] + f[3] > s.spriteSourceSize.h) {
                        f[3] = s.spriteSourceSize.h - f[1];
                    }
                }
                f[0] += s.frame.x;
                f[1] += s.frame.y;
            }
        }
        
        str = img;
        ss.images[imageIndex] = str;

        // merge images if they're the same.
        i = 0;
        while (i !== ss.images.length) {
            if ((i !== imageIndex) && (ss.images[i] === str)) {
                if (imageIndex > i) { // We choose to merge into the lowest index so we're moving less.
                    imageIndex = i;
                    i += 1;
                } else {
                    updateImageIndex(ss.frames, i, imageIndex);
                    ss.images.splice(i, 1);
                }
            } else {
                i += 1;
            }
        }
        
        return ss;
    },
    updatePack = function (pack, spriteSheets, imageMap) {
        const
            {frames} = pack;
        
        // Handle one-to-one unlisted or nonexistent sprite sheets
        for (const frame in frames) {
            if (Object.prototype.hasOwnProperty.call(frames, frame)) {
                const
                    key = createKey(frame);
                
                if (imageMap[key]) {
                    let i = imageMap[key].length;

                    while (i--) {
                        reposition(imageMap[key][i], pack.meta.image, frames[frame], key);
                    }
                } else {
                    spriteSheets[key] = createDefault(frames[frame], pack.meta.image);
                }
            }
        }
    };

export default function (spriteSheets, projectSrc) {
    const
        packs = [],
        imageToSSMap = {},
        sSs = {};
    let i = 0;

    // Create sprite sheet list and list packed textures where applicable
    for (const key in spriteSheets) {
        const
            spriteSheet = spriteSheets[key];
            
        if (spriteSheet.meta) { // This is a TexturePacker file
            packs.push(spriteSheet);
        } else {
            sSs[key] = spriteSheet;
            sSs[key].id = key; // used by Platypus for smart caching.
            if (spriteSheet.images) {
                let j = spriteSheet.images.length;

                while (j--) {
                    const
                        str = spriteSheet.images[j];
                    let mapKey = '';

                    /*if (/^[^\/]*$/.test(str)) {
                        str = projectSrc + str;
                        if (str.indexOf('.') < 0) {
                            str += '.png';
                        }
                        spriteSheet.images[j] = str;
                    }*/
                    mapKey = createKey(str, projectSrc);
                    if (imageToSSMap[mapKey]) {
                        imageToSSMap[mapKey].push(spriteSheet);
                    } else {
                        imageToSSMap[mapKey] = [spriteSheet];
                    }
                }
            }
        }
    }
    
    // Now implement packed versions where applicable.
    i = packs.length;
    while (i--) {
        updatePack(packs[i], sSs, imageToSSMap);
    }
    
    return sSs;
}
