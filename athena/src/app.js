import moment from 'moment';
import routeCreator from './routes';

export default (Website, { blocks, routes, templates, locale }) => {
  if (Array.isArray(blocks)) {
    blocks = blocks.reduce((a, b) => Object.assign({}, a, b), {});
  }
  // edits.add('Schema', Schema);
  routes = routeCreator({
    routes,
    templates,
    Website
  });

   // Datum/Zeit-Locale
  moment.locale((locale || 'de'));
  return {
    routes,
    context: {
      templates,
      blocks: blocks || {},
    },
  };
};
