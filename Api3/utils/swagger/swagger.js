"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocs = void 0;
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// import { version } from "../../package.json";
// create options for swaggerJsdoc options
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: 'Express API for API Practice',
            version: '1.0.0',
            description: 'This is the Express API for my backend projects',
        },
        // servers: [
        //     {
        //       url: 'http://localhost:3000',
        //       description: 'Development server',
        //     },
        //   ],
        components: {
            securitySchemas: {
                bearerAuth: {
                    type: "http",
                    schema: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [
            { bearerAuth: [], }
        ]
    },
    apis: [path_1.default.resolve(__dirname, '../../swagger.yaml')],
};
const swaggerSPec = (0, swagger_jsdoc_1.default)(options);
function swaggerDocs(app, port) {
    // 1.Swagger page
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSPec));
    // Docs in Json Format
    app.get('docs-json', (req, res) => {
        res.setHeader('Content-Type', "application/json");
        res.send(swaggerSPec);
    });
}
exports.swaggerDocs = swaggerDocs;
