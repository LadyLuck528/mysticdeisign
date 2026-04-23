// text.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.text = {
    id: 'text',
    name: 'Text',
    icon: 'icon-text',
    cursor: 'text',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('Text tool activated');
    },

    deactivate(editor) {
        console.log('Text tool deactivated');
    }
};
