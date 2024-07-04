"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_body_1 = __importDefault(require("koa-body"));
const path = __importStar(require("node:path"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa2_cors_1 = __importDefault(require("koa2-cors"));
const semver_max_1 = __importDefault(require("semver-max"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const router = new koa_router_1.default();
const app = new koa_1.default();
app.use((0, koa2_cors_1.default)());
const dirPath = path.join(__dirname, './../public');
router.get('/', (ctx, next) => {
    ctx.body = `rmst-${Math.random()}`;
});
router.get('/latest', (ctx, next) => {
    const filesName = fs_extra_1.default.readdirSync(dirPath).filter(item => fs_extra_1.default.statSync(path.join(dirPath, item)).isDirectory());
    const max = (0, semver_max_1.default)(...filesName);
    ctx.redirect(`http://localhost:3222/${max}`);
});
router.post('/uploadFile', (0, koa_body_1.default)({
    multipart: true,
    formidable: {
        maxFileSize: 2000000 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
    }
}), (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const files = ctx.request.files;
    const body = ctx.request.body;
    // koaBody 中间件会自动将 form-data 中的文件放入 ctx.request.files 字段, 将其他放入 ctx.request.body 字段
    console.log('--- ctx.request.files', Object.keys(ctx.request.files));
    console.log('--- body', body);
    const versionDirPath = path.join(dirPath, body.version);
    fs_extra_1.default.ensureDirSync(versionDirPath);
    Object.keys(files).forEach(key => {
        const itemFile = files[key];
        const fileReader = fs_extra_1.default.createReadStream(itemFile.filepath);
        const filePath = path.join(versionDirPath, `/${itemFile.originalFilename}`);
        const writeStream = fs_extra_1.default.createWriteStream(filePath);
        fileReader.pipe(writeStream);
    });
    ctx.body = '成功';
}));
app.use(router.routes());
app.listen(3111, () => {
    console.log('启动');
});
