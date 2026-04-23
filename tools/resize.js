export const ResizeTool = {
    activate() {
        console.log("Resize tool activated");
        EventBus.emit('panel:open', 'resize-panel');
    },
    deactivate() {
        EventBus.emit('panel:close', 'resize-panel');
    }
};
