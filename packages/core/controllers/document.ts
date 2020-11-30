import { Request, Response, NextFunction, Router } from 'express';
import { Repository } from 'typeorm';

import TypeBase, { EntitySchema } from '../typebase';
import {
  ErrDocumentNotFound,
  ErrInvalidSchema,
  ErrInternalServer,
  ErrInvalidQuery,
} from '../errors';

export class DocumentController {
  private base: TypeBase;
  private repo: Repository<EntitySchema>;
  private entity: EntitySchema;
  private readonly router: Router;
  private readonly relations: string[];

  constructor(base: TypeBase, entity: EntitySchema) {
    this.base = base;
    this.repo = base.database.getRepository(entity.options.name);
    this.entity = entity;
    this.router = Router();
    this.relations = Object.keys(entity.options.relations);

    this.router.post(
      '/',
      async (req: Request, res: Response, next: NextFunction) =>
        await this._create(req, res, next)
    );
    this.router.get(
      '/all',
      async (req: Request, res: Response, next: NextFunction) =>
        await this.getAll(req, res, next)
    );
    this.router.get(
      '/:ID',
      async (req: Request, res: Response, next: NextFunction) =>
        await this._read(req, res, next)
    );
    this.router.patch(
      '/:ID',
      async (req: Request, res: Response, next: NextFunction) =>
        await this._update(req, res, next)
    );
    this.router.delete(
      '/:ID',
      async (req: Request, res: Response, next: NextFunction) =>
        await this._delete(req, res, next)
    );
  }

  private async getAll(req: Request, res: Response, next: NextFunction) {
    const { skip = 0, take = 10 } = req.query;
    const where = Object.assign(
      Object.keys(req.query)
        .filter(
          (k) =>
            ![
              'take',
              'skip',
              'order',
              'orderBy',
              'searchBy',
              'searchFor',
            ].includes(k)
        )
        .map((k) => ({ [k]: req.query[k] }))
    );

    try {
      const [allDocuments, count] = await this.repo.findAndCount({
        skip,
        take,
        where,
      } as any);
      res.status(200).set('X-Total-Count', `${count}`);
      res.json(allDocuments);
    } catch (e) {
      console.log(e);
      next(ErrInvalidQuery);
    }
  }

  // Todo: Validate body
  private async _create(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    try {
      const document = await this.repo.save(body);
      res.status(201).json(document);
    } catch (e) {
      next(ErrInvalidSchema);
    }
  }

  private async _read(req: Request, res: Response, next: NextFunction) {
    const id = req.params['ID'];
    const relations = this.relations;

    let document: any;

    try {
      document = await this.repo.findOneOrFail({ where: { id }, relations });
      res.json(document);
    } catch (e) {
      next(ErrDocumentNotFound);
    }
  }

  // Todo: Validate body
  private async _update(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    const id = req.params['ID'];
    const relations = this.relations;

    let document: any;

    try {
      document = await this.repo.findOneOrFail({ where: { id }, relations });
    } catch (e) {
      next(ErrDocumentNotFound);
      return;
    }

    // Merge old document and body to get the new document
    Object.assign(document, body);

    try {
      // Save and send updated document
      const newDocument = await this.repo.save(document);
      res.status(201).json(newDocument);
    } catch (e) {
      next(ErrInternalServer);
    }
  }

  private async _delete(req: Request, res: Response, next: NextFunction) {
    const id = req.params['ID'];
    const relations = this.relations;

    let document: any;

    try {
      document = await this.repo.findOneOrFail({ where: { id }, relations });
    } catch (e) {
      next(ErrDocumentNotFound);
      return;
    }

    try {
      const deletedDocument = await this.repo.remove(document);
      res.status(200).json(deletedDocument);
    } catch (e) {
      next(ErrInternalServer);
    }
  }

  public get Router(): Router {
    return this.router;
  }
}
