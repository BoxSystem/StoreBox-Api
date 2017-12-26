import { NestFactory } from "@nestjs/core";
import { config } from "@utils/config";
import { ApplicationModule } from "./modules/app.module";
import { initExpress } from "./express";

const bootstrap = async () => {
    const server = initExpress();

    const app = await NestFactory.create(ApplicationModule, server);
    app.setGlobalPrefix("/api/v1");
    await app.listen(config.server.port);
    return app.getHttpServer();
};

export = bootstrap();