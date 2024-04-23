export default {
    "id": "action-layer",
    "components": [{
        "type": "HandlerController"
    }, {
        "type": "HandlerLogic",
        "alwaysOn": true
    }, {
        "type": "HandlerRender"
    }, {
        "type": "Camera",
        "width": 1024,
        "height": 1024,
        "overflow": true,
        "x": 512,
        "y": 512,
        "z": 1,
        "transitionX": 0,
        "transitionY": 0,
        "transitionAngle": 0
    }, {
        "type": "EntityContainer",
        "entities": [],
        "childEvents": []
    }],
    properties: {
        level: 'default'
    }
};
