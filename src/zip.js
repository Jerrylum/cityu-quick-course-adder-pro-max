import AdmZip from 'adm-zip'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const manifest = require('../build/manifest.json')

const fileName = `${manifest.name.replaceAll(' ', '-')}-${manifest.version}.zip`

var zip = new AdmZip()
zip.addLocalFolder('build')
zip.writeZip('./package/' + fileName)
