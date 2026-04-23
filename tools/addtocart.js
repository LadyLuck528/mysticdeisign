// addtocart.js
window.EditorTools = window.EditorTools || {};

window.EditorTools.addtocart = {
    id: 'addtocart',
    name: 'Add to Cart',
    icon: 'icon-cart',
    cursor: 'pointer',

    activate(editor) {
        editor.activeTool = this.id;
        console.log('Add to Cart tool activated');
    },

    deactivate(editor) {
        console.log('Add to Cart tool deactivated');
    }
};
