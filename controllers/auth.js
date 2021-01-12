const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');


const crearUsuario = async(req, res = response) => {

    const { email, password } = req.body;

    try {

        const existeEmail = await Usuario.findOne({ email });

        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'Correo no Valido'
            });
        }


        const usuario = new Usuario(req.body);


        // encriptar contraseña

        const salt = bcrypt.genSaltSync();

        usuario.password = bcrypt.hashSync(password, salt);


        await usuario.save();

        // Generar mi JSON WEB TOCKEN (JWT)
        const token = await generarJWT(usuario.id);


        res.json({
            ok: true,
            usuario,
            token
            // msg: 'Usuario Creado!!'
            // body: req.body
        });


    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });

    }


}

const login = async(req, res) => {
    const { email, password } = req.body;
    try {

        const usuarioDB = await Usuario.findOne({ email });
        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'Credenciales invalidas!'
            });
        }

        // valida password
        const validPassword = bcrypt.compareSync(password, usuarioDB.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales invalidas!!'
            });
        }

        const token = await generarJWT(usuarioDB.id);




        res.json({
            ok: true,
            usuario: usuarioDB,
            token
            // msg: 'Usuario Creado!!'
            // body: req.body
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }
}

const renewToken = async(req, res = response) => {
    // const { token } = req.body;

    const uid = req.uid;

    const token = await generarJWT(uid);

    const usuarioDB = await Usuario.findById(uid);



    res.json({
        ok: true,
        uid: req.uid,
        usuario: usuarioDB,
        token
    });

}


module.exports = {
    crearUsuario,
    login,
    renewToken

}