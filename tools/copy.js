// copy.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.copy = {
    id: 'copy',
    name: 'Copy',
    icon: 'icon-copy',
    cursor: 'default',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('Copy tool activated');
    },

    deactivate(editor) {
        console.log('Copy tool deactivated');
    }
};
