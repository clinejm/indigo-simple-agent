var mockAgent = require('stratumn-mock-agent').mockAgent;
var transitions = require('../lib/actions');

describe('transitions', function() {

  var map;

  beforeEach(function() {
    map = mockAgent(transitions);
  });

  describe('#init()', function() {

    it('sets the state correctly', function() {
      return map
        .init('Hello, World!')
        .then(function(link) {
          link.state.title.should.be.exactly('Hello, World!');
          link.state.messages.should.be.an.Array();
          link.state.messages.length.should.be.exactly(0);
          link.state.updatedAt.should.be.a.Number();
        });
    });

    it('requires a title', function() {
      return map
        .init()
        .then(function(link) {
          throw new Error('link should not have been created');
        })
        .catch(function(err) {
          err.message.should.be.exactly('a title is required');
        });
    });

  });

  describe('#addMessage()', function() {

    it('updates the state correctly', function() {
      var prevUpdatedAt;

      return map
        .init('Hello, World!')
        .then(function(link) {
          prevUpdatedAt = link.state.updatedAt;
          return map.addMessage('Hi', 'Me');
        })
        .then(function(link) {
          link.state.messages.length.should.be.exactly(1);
          link.state.messages.should.deepEqual([{ message: 'Hi', author: 'Me' }]);
          link.state.updatedAt.should.not.be.below(prevUpdatedAt);
        });
    });

    it('requires a message', function() {
      return map
        .init('Hello, World!')
        .then(function(link) {
          return map.addMessage();
        })
        .then(function(link) {
          throw new Error('link should not have been created');
        })
        .catch(function(err) {
          err.message.should.be.exactly('a message is required');
        });
    });

    it('requires an author', function() {
      return map
        .init('Hello, World!')
        .then(function(link) {
          return map.addMessage('Hi');
        })
        .then(function(link) {
          throw new Error('link should not have been created');
        })
        .catch(function(err) {
          err.message.should.be.exactly('an author is required');
        });
    });

  });

  describe('#addTag()', function() {

    it('updates the state correctly', function() {
      var prevUpdatedAt;

      return map
        .init('Hello, World!')
        .then(function(link) {
          prevUpdatedAt = link.state.updatedAt;
          return map.addTag('random');
        })
        .then(function(link) {
          link.meta.tags.should.be.an.Array();
          link.meta.tags.length.should.be.exactly(1);
          link.meta.tags.should.deepEqual(['random']);
          link.state.updatedAt.should.not.be.below(prevUpdatedAt);
        });
    });

    it('requires a tag', function() {
      return map
        .init('Hello, World!')
        .then(function(link) {
          return map.addTag();
        })
        .then(function(link) {
          throw new Error('link should not have been created');
        })
        .catch(function(err) {
          err.message.should.be.exactly('a tag is required');
        });
    });

  });

});
