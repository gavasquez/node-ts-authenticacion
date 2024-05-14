import { Router } from 'express';
import { FileUploadController } from './controller';
import { FileUploadService } from '../services/file-upload.service';
import { FileUploadMiddleware } from '../middlewares/file-upload.middleware';
import { TypeMiddleware } from '../middlewares/type.middleware';


export class FileUploadRoutes {


  static get routes(): Router {

    const router = Router();
    const controller = new FileUploadController(
      new FileUploadService()
    );

    //* Aplicar el middleware en todas las rutas
    router.use(FileUploadMiddleware.containtFiles);
    router.use(TypeMiddleware.validType(['users', 'products', 'categories']));

    // Definir las rutas
    // api/upload/single<user | category | prodcut>
    // api/upload/multiple<user | category | prodcut>
    router.post('/single/:type', controller.uploadFile);
    router.post('/multiple/:type', controller.uploadMultipleFile);

    return router;
  }


}

