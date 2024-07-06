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
const koa_static_server_1 = __importDefault(require("koa-static-server"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const router = new koa_router_1.default();
const app = new koa_1.default();
const publicDirPath = './public';
app.use((0, koa_static_server_1.default)({ rootDir: publicDirPath, rootPath: '/public' }));
app.use((0, koa2_cors_1.default)());
router.get('/', (ctx, next) => {
    ctx.body = `rmst-${Math.random()}`;
});
router.get('/get-test', (ctx, next) => {
    ctx.body = `get-test`;
});
router.post('/post-test', (ctx, next) => {
    ctx.body = `post-test`;
});
// router.get('/latest', (ctx, next) => {
//   const filesName = fse.readdirSync(dirPath).filter(item => fse.statSync(path.join(dirPath, item)).isDirectory())
//   const max = semverMax(...filesName)
//   fse.copySync(path.join(dirPath, max), path.join(dirPath, 'latest'))
//   ctx.redirect(`http://localhost:1666/latest`)
// })
router.post('/uploadFile', (0, koa_body_1.default)({
    multipart: true,
    formidable: {
        maxFileSize: 2000000 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
    }
}), (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const files = ctx.request.files;
    const body = ctx.request.body;
    if (!(body === null || body === void 0 ? void 0 : body.version)) {
        ctx.body = 'version 不能为空';
        return;
    }
    // koaBody 中间件会自动将 form-data 中的文件放入 ctx.request.files 字段, 将其他放入 ctx.request.body 字段
    console.log('--- ctx.request.files', Object.keys(ctx.request.files));
    console.log('--- body', body);
    const versionDirPath = path.join(publicDirPath, body.version);
    console.log('versionDirPath', versionDirPath);
    fs_extra_1.default.ensureDirSync(versionDirPath);
    yield Promise.all(Object.keys(files).map(key => {
        return new Promise(resolve => {
            const itemFile = files[key];
            const fileReader = fs_extra_1.default.createReadStream(itemFile.filepath);
            const filePath = path.join(versionDirPath, `/${itemFile.originalFilename}`);
            const writeStream = fs_extra_1.default.createWriteStream(filePath);
            fileReader.pipe(writeStream).on('finish', () => {
                resolve(null);
            });
        });
    }));
    const latestDirPath = path.join(publicDirPath, 'latest');
    console.log('latestDirPath', latestDirPath);
    fs_extra_1.default.ensureDirSync(latestDirPath);
    fs_extra_1.default.removeSync(latestDirPath);
    fs_extra_1.default.copySync(versionDirPath, latestDirPath);
    ctx.body = '成功';
}));
app.use(router.routes());
app.listen(1666, () => {
    console.log('启动', 1666);
});
