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
    console.log('ctx.request.files', ctx.request.files)

    ctx.body = '成功'

    const body = ctx.request.body
    console.log('--- body', body)

    const versionDirPath = path.join(dirPath, body.version)

    fse.ensureDirSync(versionDirPath)

    Object.keys(files).forEach(key => {
      if (key === 'version') {
        return
      }

      const itemFile = files[key]

      const fileReader = fse.createReadStream(itemFile.filepath)

      const filePath = path.join(versionDirPath, `/${itemFile.originalFilename}`)
      console.log('filePath', filePath)

      // fse.ensureFileSync(filePath)
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
