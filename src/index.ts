import Koa from 'koa'
import koaBody from 'koa-body'
import * as path from 'node:path'
import Router from 'koa-router'
import cors from 'koa2-cors'

import fse from 'fs-extra'

const router = new Router()
const app = new Koa()

app.use(cors())

router.get('/latest', (ctx, next) => {
  ctx.body = 'xxx'

  ctx.redirect('http://localhost:3222')
})

const dirPath = path.join(__dirname, './../public')

router.post(
  '/uploadFile',
  koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 2000000 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
    }
  }),
  async (ctx, next) => {
    const files = ctx.request.files
    const body = ctx.request.body

    // koaBody 中间件会自动将 form-data 中的文件放入 ctx.request.files 字段, 将其他放入 ctx.request.body 字段
    console.log('--- ctx.request.files', Object.keys(ctx.request.files))
    console.log('--- body', body)

    const versionDirPath = path.join(dirPath, body.version)
    fse.ensureDirSync(versionDirPath)

    Object.keys(files).forEach(key => {
      const itemFile = files[key]

      const fileReader = fse.createReadStream(itemFile.filepath)
      const filePath = path.join(versionDirPath, `/${itemFile.originalFilename}`)

      const writeStream = fse.createWriteStream(filePath)

      fileReader.pipe(writeStream)
    })

    ctx.body = '成功'
  }
)

app.use(router.routes())

app.listen(3111, () => {
  console.log('启动')
})
