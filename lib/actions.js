module.exports = {

  /**
   * Creates a new TODO list.
   * @param {string} title - a name for the list
   */
  init: function(title) {
    // Validate parameters.
    if (!title) {
      return this.reject('title required');
    }

    // Save the list info.
    this.state = {
      title: title
    };

    // Set the `list` tag.
    this.meta.tags = ['list'];

    // Create the first segment.
    this.append();
  },

  /**
   * Adds an item to the TODO list.
   * @param {string} description - a description of the item
   */
  addItem: function(description) {
    // Validate parameters.
    if (!description) {
      return this.reject('description required');
    }

    // Make sure we are appending a list segment. It should have the `list` tag.
    if (this.meta.tags.indexOf('list') < 0) {
      return this.reject('not a list');
    }

    // Save the item info.
    this.state = {
      description: description
    };

    // Set the `item` tag.
    this.meta.tags = ['item'];

    // Append the new segment.
    this.append();
  },

  /**
   * Completes an item in the TODO list.
   */
  completeItem: function() {
    // Make sure we are appending an item segment. It should have the `item` tag.
    if (this.meta.tags.indexOf('item') < 0) {
      return this.reject('not an item');
    }

    // We don't need anything in the state.
    this.state = {};

    // Set the `completion` tag.
    this.meta.tags = ['completion'];

    // Append the new segment.
    this.append();
  }
};
