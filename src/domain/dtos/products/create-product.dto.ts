import { Validators } from "../../../config";


export class CreateProductDto {

    private constructor(
        public readonly name: string,
        public readonly available: boolean,
        public readonly price: number,
        public readonly description: string,
        public readonly user: string, // ID del usuario
        public readonly category: string, // ID de la categoria
    ) { }

    static create(object: { [key: string]: any }): [string?, CreateProductDto?] {

        const {
            name,
            available,
            price,
            description,
            user,
            category
        } = object;

        if (!name) return ['Missing name'];

        if (!user) return ['Missing user'];

        if (!Validators.isMongoId(user)) return ['Invalid user Id'];

        if (!category) return ['Missing category'];

        if (!Validators.isMongoId(category)) return ['Invalid category Id'];


        return [undefined, new CreateProductDto(name, !!available, price, description, user, category)];
    }
}