export const SharpenTool = {
    activate() {
        console.log("Sharpen tool activated");
        EventBus.emit('panel:open', 'sharpen-panel');
    },
    deactivate() {
        EventBus.emit('panel:close', 'sharpen-panel');
    }
};
