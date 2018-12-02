// @flow

import ImageURLEditor from './ui/ImageURLEditor';
import MathEditor from './ui/MathEditor';
import React from 'react';
import UICommand from './ui/UICommand';
import createPopUp from './ui/createPopUp';
import nullthrows from 'nullthrows';
import {EditorState, Selection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Fragment, Schema} from 'prosemirror-model';
import {MATH} from './NodeNames';
import {TextSelection} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {showCursorPlaceholder, hideCursorPlaceholder} from './CursorPlaceholderPlugin';

function insertMath(
  tr: Transform,
  schema: Schema,
  latex: ?string,
): Transform {
  const {selection, doc} = tr;
  if (!selection) {
    return tr;
  }
  const {from, to} = selection;
  if (from !== to) {
    return tr;
  }

  const image = schema.nodes[MATH];
  if (!image) {
    return tr;
  }

  const attrs = {
    latex,
  };

  const prevNode = tr.doc.nodeAt(from);
  const node = image.create(attrs, null, null);
  const frag = Fragment.from(node);
  tr = tr.insert(from, frag);
  return tr;
}

class MathEditCommand extends UICommand {

  _popUp = null;

  isEnabled = (state: EditorState, view: ?EditorView): boolean => {
    const tr = state;
    const {selection} = state.tr;
    if (selection instanceof TextSelection) {
      return selection.from === selection.to;
    }
    return false;
  };

  waitForUserInput = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    event: ?SyntheticEvent,
  ): Promise<any> => {
    if (this._popUp) {
      return Promise.resolve(undefined);
    }

    if (dispatch) {
      dispatch(showCursorPlaceholder(state));
    }

    return new Promise(resolve => {
      const props = {
        runtime: view ? view.runtime : null,
        initialValue: null,
      };
      this._popUp = createPopUp(MathEditor, props, {
        modal: true,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            resolve(val);
          }
        }
      });
    });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    latex: ?string,
  ): boolean => {
    if (dispatch) {
      let {tr, selection, schema} = state;
      tr = view ? hideCursorPlaceholder(view.state) : tr;
      tr = tr.setSelection(selection);
      if (latex) {
        tr = insertMath(tr, schema, latex);
      }
      dispatch(tr);
      view && view.focus();
    }

    return false;
  };
}

export default MathEditCommand;
