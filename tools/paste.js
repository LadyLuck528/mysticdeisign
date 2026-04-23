// paste.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.paste = {
    id: 'paste',
    name: 'Paste',
    icon: 'icon-paste',
    cursor: 'default',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('Paste tool activated');
    },

    deactivate(editor) {
        console.log('Paste tool deactivated');
    }
};
