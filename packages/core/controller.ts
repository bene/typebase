import { Request, Response, NextFunction, Router } from 'express';
import { Repository } from 'typeorm';

import TypeBase, { EntitySchema } from './typebase-app';
import { ErrDocumentNotFound, ErrInvalidDatabaseQuery } from './errors';

export class Controller {
  private readonly router: Router;
  private base: TypeBase;
  private repo: Repository<EntitySchema>;
  private entity: EntitySchema;

  constructor(base: TypeBase, entity: EntitySchema) {
    this.base = base;
    this.repo = base.database.getRepository(entity.options.name);
    this.entity = entity;
    this.router = Router();

    this.router.post('/', (req: Request, res: Response, next: NextFunction) =>
      this._create(req, res, next)
    );
    this.router.get('/:ID', (req: Request, res: Response, next: NextFunction) =>
      this._read(req, res, next)
    );
    this.router.patch(
      '/:ID',
      (req: Request, res: Response, next: NextFunction) =>
        this._update(req, res, next)
    );
    this.router.delete(
      '/:ID',
      (req: Request, res: Response, next: NextFunction) =>
        this._delete(req, res, next)
    );
  }

  private _create(req: Request, res: Response, next: NextFunction) {}

  private async _read(req: Request, res: Response, next: NextFunction) {
    const id = req.params['ID'];
    const relations = Object.keys(this.entity.options.relations);

    let document: any;

    try {
      document = await this.repo.findOne({ where: { id }, relations });
    } catch (e) {
      // Log error fpr dev/admin
      next(ErrInvalidDatabaseQuery);
      return;
    }

    if (!!document) {
      res.json(document);
    } else {
      next(ErrDocumentNotFound);
    }
  }

  private _update(req: Request, res: Response, next: NextFunction) {}

  private _delete(req: Request, res: Response, next: NextFunction) {}

  public get Router(): Router {
    return this.router;
  }
}
