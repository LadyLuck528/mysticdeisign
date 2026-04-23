// clipart.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.clipart = {
    id: 'clipart',
    name: 'Clipart',
    icon: 'icon-clipart',
    cursor: 'pointer',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('Clipart tool activated');
    },

    deactivate(editor) {
        console.log('Clipart tool deactivated');
    }
};
