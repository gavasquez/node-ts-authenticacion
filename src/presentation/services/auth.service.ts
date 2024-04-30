import { JwtAdapter, bcryptAdaptar } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";


export class AuthService {

    constructor() { }

    public async registerUser(registerUserDto: RegisterUserDto) {

        const existUser = await UserModel.findOne({
            email: registerUserDto.email,
        });

        if (existUser) throw CustomError.badReques('Email already exist');

        try {

            const user = new UserModel(registerUserDto);
            // Encriptar la contraseña
            user.password = bcryptAdaptar.hash(registerUserDto.password);
            await user.save();
            // JWT <--- para mantener la authenticacion del usuario

            // Email de confirmación

            const { password, ...userEntity } = UserEntity.fromObject(user);
            return { user: userEntity, token: 'ABC' };
        } catch (error) {
            throw CustomError.internalServe(`${error}`);
        }
    }

    public async loginUser(loginUserDto: LoginUserDto) {

        const existUser = await UserModel.findOne({
            email: loginUserDto.email,
        });

        if (!existUser) throw CustomError.badReques('Email not exist');

        const isMatching = bcryptAdaptar.compare(loginUserDto.password, existUser.password);

        if (!isMatching) throw CustomError.unauthorized('Credentials incorrects');

        const { password, ...userEntity } = UserEntity.fromObject(existUser);

        const token = await JwtAdapter.generateToken({ id: existUser.id, email: existUser.email });
        if(!token) throw CustomError.internalServe('Error while creating JWT');

        return {
            user: userEntity,
            token: token,
        }


    };
}