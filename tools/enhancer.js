export const EnhancerTool = {
    activate() {
        console.log("Image Enhancer activated");
        EventBus.emit('panel:open', 'enhancer-panel');
    },
    deactivate() {
        EventBus.emit('panel:close', 'enhancer-panel');
    }
};
