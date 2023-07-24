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
        "width": 4000,
        "height": 4000,
        "overflow": true,
        "x": 4300,
        "y": 2000,
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
