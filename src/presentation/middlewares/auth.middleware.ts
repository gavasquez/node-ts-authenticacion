import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { UserEntity } from "../../domain";

export class AuthMiddleware {

    static async validateJWT(req: Request, res: Response, next: NextFunction) {
        const authorization = req.header('Authorization');
        if (!authorization) return res.status(401).json({ error: 'No token provided' });
        if (!authorization.startsWith('Bearer ')) return res.status(401).json({ error: 'Invalid Bearer token' });
        // Cortamos el token por espacio y tomamos con el at la primera posicion
        const token = authorization.split(' ').at(1) || '';
        try {

            const payload = await JwtAdapter.validateToken<{ id: string }>(token);
            if (!payload) return res.status(401).json({ error: 'Invalid token' });
            const user = await UserModel.findById(payload.id);
            if (!user) return res.status(401).json({ error: 'Invalid token - user' });
            //! Validar si el usuario esta activo
            // Ponemos el usuario en la body
            req.body.user = UserEntity.fromObject(user);
            // Todo paso bien, entonces se llama el next
            next();

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}