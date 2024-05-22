import path from 'path'

const magicMatch = {
  // ffd8ffeb is for image created by bing image creator
  '.jpg': ['ffd8ffe0', 'ffd8dde0', 'ffd8ffdb', 'ffd8ffe1', 'ffd8ffeb'],
  '.jpeg': ['ffd8ffe0', 'ffd8dde0', 'ffd8ffdb', 'ffd8ffe1', 'ffd8ffeb'],
  '.png': ['89504e47'],
  '.gif': ['47494638'],
  '.webp': ['52494646'],
  '.psd': ['38425053'],
  '.mp4': ['00000014', '00000018', '00000020', '0000001c'],
  '.wav': ['52494646'],
  '.mp3': ['494433', 'fffa', 'fffb', 'fffe'],
  '.mid': ['4d546864'],
  '.midi': ['4d546864'],
  '.pdf': ['25504446'],
  '.docx': ['504b0304'],
  '.pptx': ['504b0304'],
  '.xlsx': ['504b0304'],
  '.zip': ['504b0304']
}

export default function (file) {
  const needsCheckFormats = Object.keys(magicMatch)
  const ext = path.extname(file.originalname)

  if (needsCheckFormats.includes(ext)) {
    const fileHex = file.buffer.toString('hex', 0, 10).toLowerCase()

    // console.log(fileHex, ext, magicMatch[ext].find(magic => fileHex.startsWith(magic)))

    if (fileHex && magicMatch[ext].find(magic => fileHex.startsWith(magic))) {
      return true
    } else {
      return false
    }
  } else {
    return true
  }
}
