'use strict';

var should = require('chai').should(); // eslint-disable-line
var Hexo = require('hexo');
const defaultOption = require('../lib/helper').defaultOption;

describe('Root Tag generator', function() {
  var hexo = new Hexo(__dirname, {silent: true});
  hexo.init();
  var Post = hexo.model('Post');
  var generator = require('../lib/generator').bind(hexo);
  var posts,
    locals;

  // Default config
  hexo.config.tag_generator = {
    per_page: 10
  };
  hexo.config.root_tag_generator = defaultOption;

  before(function() {
    return Post.insert([
      {source: 'foo', slug: 'foo', date: 1e8},
      {source: 'bar', slug: 'bar', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', date: 1e8 - 1}
    ]).then(function(data) {
      posts = data;
      return posts[0].setTags(['foo', 'foo1', 'foo2']);
    }).then(function() {
      return posts[1].setTags(['bar', 'bar1', 'bar2']);
    }).then(function() {
      return posts[2].setTags(['piyo', 'bar', 'foo']);
    }).then(function() {
      locals = hexo.locals.toObject();
    });
  });

  describe('set root tags', function() {
    it('set sub tag limit 2', function() {
      hexo.config.root_tag_generator = {
        sub_tag_limit: 2,
        root_tag_names: ['foo']
      };
      var result = generator(locals);
      // 7 tags ->
      result.length.should.eql(2);

      for (var i = 0, len = result.length; i < len; i++) {
        result[i].layout.should.eql(['tag', 'archive', 'index']);
      }

      result[0].path.should.eql('tags/foo/bar/');
      result[0].data.base.should.eql('tags/foo/bar/');
      result[0].data.total.should.eql(1);

      // Restore config
      hexo.config.root_tag_generator = defaultOption;
    });

    it('set multi root_tag_names', function() {
      hexo.config.root_tag_generator = {
        sub_tag_limit: 2,
        root_tag_names: ['foo', 'bar']
      };
      var result = generator(locals);
      // 7 tags ->
      result.length.should.eql(4);

      for (var i = 0, len = result.length; i < len; i++) {
        result[i].layout.should.eql(['tag', 'archive', 'index']);
      }

      result[0].path.should.eql('tags/foo/bar/');
      result[1].path.should.eql('tags/foo/foo1/');
      result[2].path.should.eql('tags/bar/bar1/');
      result[3].path.should.eql('tags/bar/bar2/');

      // Restore config
      hexo.config.root_tag_generator = defaultOption;
    });

    it('no root_tag_names option', function() {
      hexo.config.root_tag_generator = {
        sub_tag_limit: 10,
        root_tag_names: []
      };

      var result = generator(locals);

      result.length.should.eql(0);

      // Restore config
      hexo.config.tag_generator.per_page = defaultOption;
    });

    it('set root_tag_names "all"', function() {
      hexo.config.root_tag_generator = {
        sub_tag_limit: 10,
        root_tag_names: 'all'
      };

      var result = generator(locals);

      result.filter((item) => {
        return item.path.match('tags/foo/');
      }).length.should.eql(4);

      result.filter((item) => {
        return item.path.match('tags/bar/');
      }).length.should.eql(4);

      result.filter((item) => {
        return item.path.match('tags/piyo/');
      }).length.should.eql(2);

      result.filter((item) => {
        return item.path.match('tags/foo1/');
      }).length.should.eql(2);

      // Restore config
      hexo.config.tag_generator.per_page = defaultOption;
    });
  });
});
