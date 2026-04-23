export const PerspectiveTool = {
    activate() {
        console.log("Perspective tool activated");
        EventBus.emit('panel:open', 'perspective-panel');
    },
    deactivate() {
        EventBus.emit('panel:close', 'perspective-panel');
    }
};
