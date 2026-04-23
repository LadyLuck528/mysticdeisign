// move.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.move = {
    id: 'move',
    name: 'Move',
    icon: 'icon-move',
    cursor: 'default',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('Move tool activated');
    },

    deactivate(editor) {
        console.log('Move tool deactivated');
    }
};
