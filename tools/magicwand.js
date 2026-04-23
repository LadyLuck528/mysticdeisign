// magicwand.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.magicwand = {
    id: 'magicwand',
    name: 'Magic Wand',
    icon: 'icon-magicwand',
    cursor: 'crosshair',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('Magic Wand tool activated');
    },

    deactivate(editor) {
        console.log('Magic Wand tool deactivated');
    }
};
