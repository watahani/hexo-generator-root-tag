'use strict';

const pagination = require('hexo-pagination');
const getTreePost = require('./helper').getTreePost;
const defaultOption = require('./helper').defaultOption;

module.exports = function(locals) {
  const config = this.config;
  const perPage = config.tag_generator.per_page;
  const tags = locals.tags;
  let rootTagOption = defaultOption;
  if (config.root_tag && config.root_tag) {
    rootTagOption = Object.assign(defaultOption, config.root_tag);
  }
  const rootTagNames = rootTagOption.rootTagNames;
  const postsMap = getTreePost(tags, rootTagNames);
  let posts = [];
  postsMap.forEach((childTagPosts, rootTag) => {
    childTagPosts.forEach((childPosts, childTag) => {
      const path = `tags/${rootTag.slug}/${childTag.slug}/`;
      const data = pagination(path, childPosts, {
        perPage: perPage,
        layout: ['tag', 'archive', 'index'],
        format: '/%d/',
        data: {
          tag: `${rootTag.name}+${childTag.name}`
        }
      });
      posts = posts.concat(data);
    });
  });
  return posts;
};
