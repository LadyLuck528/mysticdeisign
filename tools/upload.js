// upload.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.upload = {
    id: 'upload',
    name: 'Upload',
    icon: 'icon-upload',
    cursor: 'pointer',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('Upload tool activated');
    },

    deactivate(editor) {
        console.log('Upload tool deactivated');
    }
};
