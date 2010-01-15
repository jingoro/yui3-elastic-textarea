A YUI 3 textarea extension that allows textareas to automatically grow and shrink.

Based on http://www.oroly.com/2010/January/6/resizeable-textareas-that-grow-and-shrink-to-fit-its-content

Copyright (c) 2009 John Nishinaga
Licensed under the MIT license

## Example

    YUI().use("elastic-textarea", function(Y) {
    
      var elasticy = new Y.ElasticTextarea({
        node: "#mytextarea", // required
        minHeight: 100,      // optional (inferred from node's style if not set)
        maxHeight: 300       // optional (inferred from node's style if not set)
      });
    
    // Change minHeight or maxHeight after creation
      elasticy.set("minHeight", 200);
      elasticy.set("maxHeight", 400);
    
      // Force an update
      elasticy.update()
    
    });
