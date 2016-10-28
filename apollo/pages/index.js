module.exports = (schema, { adapter }) => {
  schema.addSchema({
    name: 'page',
    adapter,
    query: `
      page(id: String, slug: String): page
      pageList: [page]
    `,
    mutation: `
      page(id: String, input: pageInput, operationType: OPERATION_TYPE): page
      reorderPages(id: String, ids: [String], order: [Int]): [page]
    `,
    resolvers: {
      Query: {
        page: (source, args, x, { fieldASTs }) => {
          const attributes = fieldASTs[0].selectionSet.selections.map(x => x.name.value);
          if (args.slug) {
            return adapter.read('page', { attributes, filter: { slug: args.slug } });
          } return adapter.read('page', Object.assign({}, args, { attributes }));
        },
        pageList: (source, args, x, { fieldASTs }) => {
          const attributes = fieldASTs[0].selectionSet.selections.map(x => x.name.value);
          return adapter.list('page', Object.assign({}, args, { attributes }));
        }
      },
      Mutation: {
        page: (source, args, x, { fieldASTs }) => {
          const attributes = fieldASTs[0].selectionSet.selections.map(x => x.name.value);
          if (args.operationType && args.operationType === 'REMOVE') {
            return adapter.remove('page', Object.assign({}, args));
          }
          if (args.input) {
            args = Object.assign({}, args, args.input);
            delete args.input;
          }
          delete args.operationType;
          return adapter.write('page', args, { attributes });
        },
        reorderPages: (source, args, x, { fieldASTs }) => {
          const attributes = fieldASTs[0].selectionSet.selections.map(x => x.name.value);
          return Promise.all(args.ids.map((id, order) => adapter.write('page', { id, order }, { attributes })));
        }
      }
    },
    typeDefs: {
      page: `
        type {
          id: String
          menu: String
          aliasId: String
          href: String
          parentId: String
          order: Int
          name: String
          description: String
          slug: String
          blocks: Json
          templateName: String
          templateData: Json
        }
      `
    }
  });
};
