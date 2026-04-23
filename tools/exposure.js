export const ExposureTool = {
    activate() {
        console.log("Exposure tool activated");
        EventBus.emit('panel:open', 'exposure-panel');
    },
    deactivate() {
        EventBus.emit('panel:close', 'exposure-panel');
    }
};
