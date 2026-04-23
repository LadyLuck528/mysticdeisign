// backgroundremover.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.backgroundremover = {
    id: 'backgroundremover',
    name: 'Background Remover',
    icon: 'icon-backgroundremover',
    cursor: 'crosshair',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('Background Remover tool activated');
    },

    deactivate(editor) {
        console.log('Background Remover tool deactivated');
    }
};
