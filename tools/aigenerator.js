// aigenerator.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.aigenerator = {
    id: 'aigenerator',
    name: 'AI Generator',
    icon: 'icon-ai',
    cursor: 'default',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('AI Generator tool activated');
    },

    deactivate(editor) {
        console.log('AI Generator tool deactivated');
    }
};
