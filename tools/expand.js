export const ExpandTool = {
    activate() {
        console.log("Expand tool activated");
        EventBus.emit('panel:open', 'expand-panel');
    },
    deactivate() {
        EventBus.emit('panel:close', 'expand-panel');
    }
};
