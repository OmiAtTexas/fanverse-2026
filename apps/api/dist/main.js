"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] });
    app.setGlobalPrefix('api/v1');
    const port = process.env.PORT || 8080;
    await app.listen(port);
    console.log(`API running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map