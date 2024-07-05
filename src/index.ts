import Koa from 'koa'
import koaBody from 'koa-body'
import * as path from 'node:path'
import Router from 'koa-router'
import cors from 'koa2-cors'

import koaStaticServer from 'koa-static-server'

import semverMax from 'semver-max'

import fse from 'fs-extra'

const router = new Router()
const app = new Koa()

app.use(koaStaticServer({ rootDir: path.join(__dirname, './../public'), rootPath: '/public' }))
app.use(cors())

const dirPath = path.join(__dirname, './../public')

router.get('/', (ctx, next) => {
  ctx.body = `rmst-${Math.random()}`
})

router.get('/get-test', (ctx, next) => {
  ctx.body = `get-test`
})

router.post('/post-test', (ctx, next) => {
  ctx.body = `post-test`
})

// router.get('/latest', (ctx, next) => {
//   const filesName = fse.readdirSync(dirPath).filter(item => fse.statSync(path.join(dirPath, item)).isDirectory())
//   const max = semverMax(...filesName)

//   fse.copySync(path.join(dirPath, max), path.join(dirPath, 'latest'))

//   ctx.redirect(`http://localhost:1666/latest`)
// })

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
    if (!body?.version) {
      ctx.body = 'version 不能为空'
      return
    }

    // koaBody 中间件会自动将 form-data 中的文件放入 ctx.request.files 字段, 将其他放入 ctx.request.body 字段
    console.log('--- ctx.request.files', Object.keys(ctx.request.files))
    console.log('--- body', body)

    const versionDirPath = path.join(dirPath, body.version)
    fse.ensureDirSync(versionDirPath)

    await Promise.all(
      Object.keys(files).map(key => {
        return new Promise(resolve => {
          const itemFile = files[key]

          const fileReader = fse.createReadStream(itemFile.filepath)
          const filePath = path.join(versionDirPath, `/${itemFile.originalFilename}`)

          const writeStream = fse.createWriteStream(filePath)

          fileReader.pipe(writeStream).on('finish', () => {
            resolve(null)
          })
        })
      })
    )

    const latestDirPath = path.join(dirPath, 'latest')

    fse.ensureDirSync(latestDirPath)
    fse.removeSync(latestDirPath)
    fse.copySync(versionDirPath, latestDirPath)

    ctx.body = '成功'
  }
)

app.use(router.routes())

app.listen(1666, () => {
  console.log('启动', 1666)
})
