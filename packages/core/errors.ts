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

export const ErrInvalidQuery: Error = {
  statusCode: 400,
  message: 'Query is invalid.',
};

export const ErrInvalidSchema: Error = {
  statusCode: 404,
  message: 'Invalid schema.',
};

export const ErrInternalServer: Error = {
  statusCode: 500,
  message: 'Internal server error.',
};
