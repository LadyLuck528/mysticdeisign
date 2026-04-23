export const ObjectEraserTool = {
    activate() {
        console.log("Object Eraser activated");
        EventBus.emit('panel:open', 'objecteraser-panel');
    },
    deactivate() {
        EventBus.emit('panel:close', 'objecteraser-panel');
    }
};
