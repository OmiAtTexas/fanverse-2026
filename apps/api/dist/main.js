"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.setGlobalPrefix('api/v1');
    await app.listen(process.env.PORT || 3001);
    console.log(`API running on port ${process.env.PORT || 3001}`);
}
bootstrap();
//# sourceMappingURL=main.js.map