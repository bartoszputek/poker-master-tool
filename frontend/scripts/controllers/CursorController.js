export default class CursorController {
  selectedElement;

  _position;

  constructor(view) {
    this.view = view;
  }

  get position() {
    return this._position ?? 0;
  }

  set position(i) {
    if (this._position !== undefined) {
      this.view.toggleSelection(this._position);
    }

    this._position = i;

    this.view.toggleSelection(this._position);
  }

  reset() {
    if (this._position !== undefined) {
      this.view.toggleSelection(this._position);
    }

    this._position = undefined;
    this.selectedElement = undefined;
  }
}
