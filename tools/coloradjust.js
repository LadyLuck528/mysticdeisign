export const ColorAdjustTool = {
    activate() {
        console.log("Color Adjust tool activated");
        EventBus.emit('panel:open', 'coloradjust-panel');
    },
    deactivate() {
        EventBus.emit('panel:close', 'coloradjust-panel');
    }
};
