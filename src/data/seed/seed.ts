import { envs } from "../../config";
import { CategoryModel, MongoDatabase, ProductModel, UserModel } from "../mongo";
import { seedData } from "./data";


(async() => {
    await MongoDatabase.connect({
        dbName: envs.MONGO_DB,
        mongoUrl: envs.MONGO_URL
    })
    await main();

    MongoDatabase.disconnect();
})();

const randonBetween0AndX = (x: number) => {
    return Math.floor(Math.random()* x) // 0 , 5
}

async function main() {

    // borrar todo
    await Promise.all([
        UserModel.deleteMany(),
        CategoryModel.deleteMany(),
        ProductModel.deleteMany(),
    ]);

    // Crear usuarios

    const users = await UserModel.insertMany(seedData.users);

    // crear categorias

    const categories = await CategoryModel.insertMany(
        seedData.categories.map(category => {
            return {
                ...category,
                user: users[0]._id,
            }
        })
    )

    // crear products

    const products = await ProductModel.insertMany(
        seedData.products.map(product => {
            return {
                ...product,
                user: users[randonBetween0AndX(seedData.users.length-1)]._id,
                category: categories[randonBetween0AndX(seedData.categories.length-1)]._id,
            }
        })
    );

    console.log('SEEDED');
}