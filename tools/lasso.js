// lasso.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.lasso = {
    id: 'lasso',
    name: 'Lasso',
    icon: 'icon-lasso',
    cursor: 'crosshair',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('Lasso tool activated');
    },

    deactivate(editor) {
        console.log('Lasso tool deactivated');
    }
};
