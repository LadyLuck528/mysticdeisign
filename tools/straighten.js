export const StraightenTool = {
    activate() {
        console.log("Straighten tool activated");
        EventBus.emit('panel:open', 'straighten-panel');
    },
    deactivate() {
        EventBus.emit('panel:close', 'straighten-panel');
    }
};
