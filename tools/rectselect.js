// rectselect.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.rectselect = {
    id: 'rectselect',
    name: 'Rectangle Select',
    icon: 'icon-rectselect',
    cursor: 'crosshair',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('Rectangle Select tool activated');
    },

    deactivate(editor) {
        console.log('Rectangle Select tool deactivated');
    }
};
