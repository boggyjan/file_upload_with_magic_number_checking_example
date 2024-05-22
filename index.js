import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'

import fileChecker from './fileChecker.js'
import fileUploader from './fileUploader.js'

const app = express()
const port = 2222

// 基礎的使用 multer 我們會指定 dest 作為上傳資料夾路徑，像下面這樣
// const upload = multer({ dest: 'uploads/' })
// 但在這個範例中，因為我們想要檢查副檔名是否符合我們許可上傳的檔案格式，並且檔案內容符合副檔名描述，然後再傳到CDN
// 因此我們選擇使用 multer.memoryStorage，來暫存於主機
// 不過使用此方式時，一定要像下方這樣限制檔案大小，否則上傳大檔案時，會很耗記憶體
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  fileFilter (req, file, cb) {
    const ext = path.extname(file.originalname)

    // 先單純判斷副檔名
    const acceptFormats = ['.svg', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.psd', '.mp4', '.wav', '.mp3', '.mid', '.midi', '.pdf', '.docx', '.pptx', '.xlsx', '.zip']
    if (!acceptFormats.includes(ext)) {
      return cb(new Error('File type not allowed'))
    }

    cb(null, true)
  },
  limits: {
    // 限制檔案大小 2mb
    // * 這邊注意一定要是整數！！！
    fileSize: 2 * 1024 * 1024
  }
})

const multerMiddleware = (req, res, next) => {
  upload.array('files')(req, res, (err) => {
    if (err) {
      return res.status(400).send({ message: err.message })
    }
    next()
  })
}

app.post('/upload', multerMiddleware, async (req, res, next) => {
  // 使用 multer 的話，連參數都可以幫你 parse 很方便的工具
  // console.log(req.body)

  if (req.files && req.files.length) {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]
      const filename = new Date().getTime() + '_' + Math.floor(Math.random() * 1E+12)
      const ext = path.extname(file.originalname)
      const filepath = 'uploads'
      const newpath = filepath + '/' + filename + ext

      if (fileChecker(file)) {
        const uploadedUrl = await fileUploader(file.buffer, filepath, filename + ext)
        file.newfilename = filename
        file.cdnUrl = uploadedUrl.replace('.jp-osa-1.linodeobjects.com', '')
      } else {
        file.error = 'File format does not match file ext'
      }
    }
  }

  const result = req.files.map((file) => {
    return {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: file.cdnUrl || null,
      error: file.error || null
    }
  })

  res.send(result)
})

app.listen(port, () => {
  console.log(`Server for testing image upload is listening on port ${port}`)
})
