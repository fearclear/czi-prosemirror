// @flow

import ParagraphNodeSpec from './ParagraphNodeSpec';
import {getParagraphNodeAttrs, MAX_INDENT_LEVEL, MIN_INDENT_LEVEL} from './ParagraphNodeSpec';
import {Node} from 'prosemirror-model';

import type {NodeSpec} from 'prosemirror';

const ATTRIBUTE_INDENT = 'data-indent';
const ALIGN_PATTERN = /(left|right|center|justify)/;
const TAG_NAME_TO_LEVEL = {
  'H1': 1,
  'H2': 2,
  'H3': 3,
  'H4': 4,
  'H5': 5,
  'H6': 6,
};

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
const HeadingNodeSpec: NodeSpec = {
  attrs: {
    ...ParagraphNodeSpec.attrs,
    level: {default: 1},
  },
  content: "inline*",
  defining: true,
  group: "block",
  parseDOM: [
    {tag: 'h1', getAttrs},
    {tag: 'h2', getAttrs},
    {tag: 'h3', getAttrs},
    {tag: 'h4', getAttrs},
    {tag: 'h5', getAttrs},
    {tag: 'h6', getAttrs},
  ],

  toDOM(node) {
    const {align, indent, level} = node.attrs;
    const tag = `h${level}`;
    const attrs = {};

    if (align) {
      attrs.style = `text-align: ${align}`;
    }

    if (indent) {
      attrs[ATTRIBUTE_INDENT] = String(indent);
    }

    return [tag, attrs, 0];
  },
};

function getAttrs(dom: HTMLElement): Object {
  const attrs: Object = getParagraphNodeAttrs(dom);
  const level = TAG_NAME_TO_LEVEL[dom.nodeName.toUpperCase()] || 1;
  attrs.level = level;
  return attrs;
}

export default HeadingNodeSpec;
