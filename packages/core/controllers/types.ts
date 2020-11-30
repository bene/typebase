import { Request, Response, NextFunction, Router } from 'express';
import { Repository } from 'typeorm';

import TypeBase, { EntitySchema } from '../typebase';
import {
  ErrDocumentNotFound,
  ErrInvalidSchema,
  ErrInternalServer,
} from '../errors';

export class TypesController {
  private base: TypeBase;
  private readonly router: Router;

  constructor(base: TypeBase) {
    this.base = base;
    this.router = Router();

    this.router.get(
      '/',
      async (req: Request, res: Response, next: NextFunction) =>
        await this.getAll(req, res, next)
    );
  }

  private async getAll(req: Request, res: Response, next: NextFunction) {
    res.json(this.base.entities);
  }

  public get Router(): Router {
    return this.router;
  }
}
