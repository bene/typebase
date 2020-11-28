interface Error {
  statusCode: Number;
  message: string;
}

export const ErrDocumentNotFound: Error = {
  statusCode: 404,
  message: 'Document does not exist.',
};

export const ErrDatabaseNotReachable: Error = {
  statusCode: 404,
  message: 'Database is not reachable.',
};

export const ErrInvalidDatabaseQuery: Error = {
  statusCode: 404,
  message: 'Query is invalid.',
};
