import { UploadedFile } from "express-fileupload";
import path from "path";
import fs from "fs";
import { Uuid } from "../../config";
import { CustomError } from "../../domain";


export class FileUploadService {

    constructor(
        private readonly uuid = Uuid.v4,
    ) { }

    private checkFolder(folderPath: string) {
        //* Validamos si existe el path y si no existe lo creamos
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
    }

    async uploadSingleFile(
        file: UploadedFile,
        folder: string = 'uploads',
        validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif']
    ) {

        try {
            //* Cortamos con split y obtenemos la segunda posicion
            const fileExtension = file.mimetype.split('/').at(1) ?? '';

            //* Validamos la extensión
            if (!validExtensions.includes(fileExtension)) {
                throw CustomError.badReques(`Invalid extension: ${fileExtension}, valid ones ${validExtensions}`);
            }

            //* Destiono de la carpeta
            const destination = path.resolve(__dirname, '../../../', folder);

            //* Validamos el folder si existe
            this.checkFolder(destination);

            //* Creamos el nombre del archivo con su extension
            const fileName = `${this.uuid()}.${fileExtension}`;

            //* Movemos el archivo
            file.mv(`${destination}/${fileName}`);

            return { fileName };
        } catch (error) {
            throw error;
        }
    }

    async uploadMultiple(
        files: UploadedFile[],
        folder: string = 'uploads',
        validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif']
    ) {

        const fileNames = await Promise.all(
            files.map(file => this.uploadSingleFile(file, folder, validExtensions))
        );
        
        return fileNames;
    }

}