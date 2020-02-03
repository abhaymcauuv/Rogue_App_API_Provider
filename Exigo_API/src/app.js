import Hapi from 'hapi';
import routes from './api/route';

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 7000,
        host: process.env.IP || "localhost",
        routes: {
            cors: {
                origin: ["*"],
                headers: ["Accept", "Content-Type"],
                additionalHeaders: ["X-Requested-With"]
            }
        }
    });
    server.route(routes);
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

init();