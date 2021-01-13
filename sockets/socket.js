const { io } = require('../index');
const { comprobarJWT } = require('../helpers/jwt');
const { usuarioConectado, usuarioDesconectado } = require('../controllers/socket');


// Mensajes de Sockets
io.on('connection', client => {
    console.log('Cliente conectado');

    // console.log(client.handshake.headers['x-token']);

    const [valido, uid] = comprobarJWT(client.handshake.headers['x-token']);
    // console.log(valido, uid);

    if (!valido) {
        return client.disconnect();
    }

    //cliente autenticado
    usuarioConectado(uid);


    // ingresar al usuario a una sala en especiico
    // sala global son los emits
    // para mensaje a un cliente se pone un client.id

    client.join(uid);

    // Escuchar del cliente el mensaje-personal
    client.on('mensaje-personal', (payload) => {
        console.log(payload);
        io.to(payload.para).emit('mensaje-personal', payload);
    });

    client.to(uid);


    client.on('disconnect', () => {
        // console.log('Cliente desconectado');
        usuarioDesconectado(uid);
    });

    // client.on('mensaje', ( payload ) => {
    //     console.log('Mensaje', payload);

    //     io.emit( 'mensaje', { admin: 'Nuevo mensaje' } );

    // });


});