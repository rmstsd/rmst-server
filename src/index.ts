import Koa from 'koa' // learn: https://www.npmjs.com/package/koa
import koaBody from 'koa-body' // learn: http://www.ptbird.cn/koa-body.html
import * as path from 'node:path'
import Router from 'koa-router'
import cors from 'koa2-cors'

import fse from 'fs-extra'

const router = new Router()
const app = new Koa()

app.use(cors())

router.get('/', (ctx, next) => {
  ctx.body = 'xxx'
})

router.post(
  '/uploadFile',
  koaBody({
    multipart: true
    // formidable: {
    //   uploadDir: './public',
    //   keepExtensions: true
    // }
  }),
  async (ctx, next) => {
    const file = ctx.request.files
    console.log('--- file', file)

    if (!file) {
      return
    }

    Object.keys(file).forEach(key => {
      const itemFile = file[key] as any

      const fileReader = fse.createReadStream(itemFile.filepath)

      const dirPath = path.join(__dirname, './../public')
      const filePath = path.join(dirPath, `/${itemFile.originalFilename}`)

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
