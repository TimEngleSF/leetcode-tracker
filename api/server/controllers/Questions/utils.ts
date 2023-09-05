export const createResIncorrectQuery = (queryName: string, type: string) => {
  return {
    code: 400,
    data: {
      error: `Request must include a ${queryName} query as type ${type}`,
    },
  };
};
