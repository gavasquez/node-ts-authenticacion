import { JwtAdapter, bcryptAdaptar, envs } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import { EmailService } from "./email.service";


export class AuthService {

    constructor(
        private readonly emailService: EmailService,
    ) { }

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
            const token = await JwtAdapter.generateToken({ id: user.id });
            if (!token) throw CustomError.internalServe('Error while creating JWT');

            // Email de confirmación
            await this.sendEmailValidationLink(user.email);

            const { password, ...userEntity } = UserEntity.fromObject(user);

            return { user: userEntity, token: token };
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

        const token = await JwtAdapter.generateToken({ id: existUser.id });
        if (!token) throw CustomError.internalServe('Error while creating JWT');

        return {
            user: userEntity,
            token: token,
        }


    };

    private sendEmailValidationLink = async (email: string) => {

        const token = await JwtAdapter.generateToken({ email });
        if (!token) throw CustomError.internalServe('Error getting token');

        const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;

        const html = `
            <h1>Validate your email</h1>
            <p>Click on the following link to validate your email</p>
            <br>
            <a href="${link}">Validate your email: ${email}</a>`;

        const options = {
            to: email,
            subject: 'Validate your email',
            htmlBody: html,
        }

        const isSet = await this.emailService.sendEmail(options);
        if (!isSet) throw CustomError.internalServe('Error sending email');
        return true;
    }

    public validateEmail = async (token: string) => {
        const payload = await JwtAdapter.validateToken(token);
        if (!payload) throw CustomError.unauthorized('Invalid token');

        const { email } = payload as { email: string };
        if (!email) throw CustomError.internalServe('Email not token');

        const user = await UserModel.findOne({ email });
        if (!user) throw CustomError.internalServe('Email not exists');
        user.emailValidated = true;
        user.save();
        return true;
    }
}