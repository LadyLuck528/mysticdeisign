export const CutoutTool = {
    activate() {
        console.log("Cutout tool activated");
        EventBus.emit('panel:open', 'cutout-panel');
    },
    deactivate() {
        EventBus.emit('panel:close', 'cutout-panel');
    }
};
