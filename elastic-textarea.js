/*
 * A YUI 3 textarea that automatically grows and shrinks.
 *
 * Based on http://www.oroly.com/2010/January/6/resizeable-textareas-that-grow-and-shrink-to-fit-its-content
 *
 * Copyright (c) 2009 John Nishinaga
 * Licensed under the MIT license
 *
 * Example:
 *
 *   YUI().use("elastic-textarea", function(Y) {
 *
 *     var elasticy = new Y.ElasticTextarea({
 *       node: "#mytextarea", // required
 *       minHeight: 100,      // optional (inferred from node's style if not set)
 *       maxHeight: 300       // optional (inferred from node's style if not set)
 *     });
 *
 *     // Change minHeight or maxHeight after creation
 *     elasticy.set("minHeight", 200);
 *     elasticy.set("maxHeight", 400);
 *
 *     // Force an update
 *     elasticy.update()
 *
 *   }
 *
 * @module elastic-textarea
 * @requires node, base
 */

YUI().add("elastic-textarea", function(Y) {
  
  function _C(config) {
    _C.superclass.constructor.apply(this, arguments);
  }
  
  _C.NAME = "elastic-textarea";
  _C.OFFSCREEN_X = "-10000px";
  _C.OFFSCREEN_Y = "-10000px";
  _C.STYLE_MIMICS = [
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'fontVariant',
    'lineHeight',
    'letterSpacing',
    'wordSpacing',
    'textIndent',
    'textTransform',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'borderTopWidth',
    'borderBottomWidth',
    'width'
  ];
  _C.COPY_NODE_HTML = '<pre style="white-space:pre-wrap;white-space:-pre-wrap;' +
    'white-space:-o-pre-wrap;word-wrap:break-word;_white-space:pre;position:absolute;visibility:hidden"></pre>'
  
  _C.ATTRS = {
    node: {
      value: null,
      writeOnce: true,
      setter: function(val) {
        var n = Y.one(val);
        if (n && n.get('nodeName') == "TEXTAREA") {
          return n;
        } else {
          return Y.Attribute.INVALID_VALUE;
        }
      }
    },
    minHeight: {
      value: null,
      validator: function(val) {
        return Y.Lang.isNull(val) || (Y.Lang.isNumber(val) && val > 0);
      }
    },
    maxHeight: {
      value: null,
      validator: function(val) {
        return Y.Lang.isNull(val) || (Y.Lang.isNumber(val) && val > 0);
      }
    }
  };

  Y.extend(_C, Y.Base, {
    
    initializer: function(config) {
      this._node = this.get('node');
      if (!this._node) {
        Y.fail("node is a required attribute");
      }
      this._node.setStyles({
        resize: 'none',
        overflow: 'hidden'
      });

      if (!this.get('minHeight')) {
        this.set('minHeight', parseInt(this._node.getStyle("minHeight"), 10) ||
                              this._getNodeHeight());
      }
      this.after("minHeightChange", this.update);

      if (!this.get('maxHeight')) {
        this.set('maxHeight', parseInt(this._node.getStyle("maxHeight"), 10));
      }
      this.after("maxHeightChange", this.update);

      this._createCopyNode();
      this._createObservers();
      this.update();
    },
    
    destructor: function() {
      this._destroyCopyNode();
      this._detachObservers();
    },
  
    _createObservers: function() {
      this._keyupHandle = this._node.on("keyup", Y.bind(this.update, this));
      this._pasteHandle = this._node.on("paste", Y.bind(this.update, this));
    },
    
    _detachObservers: function() {
      if (this._keyupHandle) {
        this._keyupHandle.detach();
        this._keyupHandle = null;
      }
      if (this._pasteHandle) {
        this._pasteHandle.detach();
        this._pasteHandle = null;
      }
    },
    
    _createCopyNode: function() {
      var copyNode = Y.Node.create(_C.COPY_NODE_HTML);
      // We do this instead of display: none because it's easier
      // to compute the dimensions without resorting to hacks
      copyNode.setStyles({
        minHeight: this.get('minHeight') + "px",
        top: _C.OFFSCREEN_Y,
        left: _C.OFFSCREEN_X
      });
      var node = this._node;
      Y.Array.each(_C.STYLE_MIMICS, function(attr) {
        copyNode.setStyle(attr, node.getComputedStyle(attr));
      });
      Y.one('body').appendChild(copyNode);
      this._copyNode = copyNode;
    },
    
    _updateCopyNode: function() {
      // Add a linebreak and space to make sure there's always a leading line
      var copyText = this.get('node').get('value') + "\n ";
      // Remove extra \r's under IE
      if (Y.UA.ie) {
        copyText = copyText.replace(/\r/g, "");
      }
      if (this._copyTextNode) {
        this._copyTextNode.remove();
      }
      this._copyTextNode = new Y.Node(document.createTextNode(copyText));
      this._copyNode.appendChild(this._copyTextNode);
    },
    
    _destroyCopyNode: function() {
      if (this._copyTextDOMNode) {
        this._copyTextDOMNode.remove();
        this._copyTextDOMNode = null;
      }
      if (this._copyNode) {
        this._copyNode.remove();
        this._copyNode = null;
      }
    },
    
    _getNodeHeight: function() {
      return parseInt(this._node.getComputedStyle('height'), 10);
    },
    
    _getCopyHeight: function() {
      return parseInt(this._copyNode.getComputedStyle('height'), 10);
    },
    
    update: function() {
      this._updateCopyNode();
      var nodeHeight = this._getNodeHeight(),
          copyHeight = this._getCopyHeight();
      if (nodeHeight != copyHeight) {
        var maxHeight = this.get('maxHeight'),
            minHeight = this.get('minHeight');
        this._node.setStyles({
          height: ((minHeight && copyHeight < minHeight) ? minHeight : copyHeight) + "px",
          overflow: ((maxHeight && copyHeight > maxHeight) ? "auto" : "hidden")
        });
      }
    }

  });

  Y.ElasticTextarea = _C;
  
}, "0.1", { requires: ["node", "base"] });
