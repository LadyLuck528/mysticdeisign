export function addNewText(editor) {
  const text = new fabric.Textbox("Your Text", {
    left: 200,
    top: 200,
    fontSize: 48,
    fill: "#ffffff",
    fontFamily: "Montserrat",
    editable: true,
    textAlign: "center"
  });

  editor.canvas.add(text);
  editor.canvas.setActiveObject(text);
  editor.canvas.renderAll();
}
