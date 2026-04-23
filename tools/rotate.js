export const RotateTool = {
    activate() {
        console.log("Rotate tool activated");
        EventBus.emit('panel:open', 'rotate-panel');
    },
    deactivate() {
        EventBus.emit('panel:close', 'rotate-panel');
    }
};
