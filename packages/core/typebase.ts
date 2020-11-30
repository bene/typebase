import { createConnection, EntitySchema, Connection } from 'typeorm';
import * as express from 'express';
import * as hbs from 'express-hbs';
import * as bodyParser from 'body-parser';
import { DocumentController } from './controllers/document';
import { TypesController } from './controllers/types';

class TypeBase {
  protected _entities: EntitySchema[] = [];
  private _connection: Connection;
  private readonly _application: express.Application;

  constructor() {
    this._application = express();

    this.application.use(bodyParser.json());
    this.application.engine('hbs', hbs.express4());
    this.application.set('view engine', 'hbs');
    this.application.set('views', __dirname + '/views');

    this.application.get(
      '/status',
      (req: express.Request, res: express.Response) => {
        const errNotConnected = {
          statusCode: 500,
          version: '1.0.0 Alpha',
          message: 'Database is not reachable.',
        };

        const ok = {
          statusCode: 200,
          version: '1.0.0 Alpha',
          message: 'Everything is OK.',
        };

        res.render('status', ok);
      }
    );

    this.application.use('/types', new TypesController(this).Router);
    this.application.listen(3223);

    console.log('TypeBase server listening on port 3223.');
  }

  public isConnected(): boolean {
    return this._connection?.isConnected;
  }

  public async connect() {
    this._connection = await createConnection({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'typebase',
      synchronize: true,
      entities: this._entities,
    });
  }

  public async disconnect() {
    if (this.isConnected()) {
      await this._connection.close();
    }
  }

  public async reconnect() {
    await this.disconnect();
    await this.connect();
  }

  public async registerEntities(entities: EntitySchema[]) {
    this._entities = this._entities.concat(entities);
    await this.reconnect();
    entities.forEach((e) => this.createController(e));
  }

  public createController(entity: EntitySchema) {
    const name = entity.options.name;
    const controller = new DocumentController(this, entity);

    this.application.use(`/${name}`, controller.Router);
    this.application.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        res.status(err.statusCode || 500).json(err);
      }
    );
  }

  public get entities(): EntitySchema[] {
    return this._entities;
  }

  public get application(): express.Application {
    return this._application;
  }

  public get database(): Connection {
    return this._connection;
  }
}

export { EntitySchema };
export default TypeBase;
