/**
 * Downloads bursary logo assets into public/bursaries/.
 * Run: node scripts/download-bursary-logos.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../public/bursaries')

/** @type {{ id: string; url: string; ext: string }[]} */
const logos = [
  {
    id: 'nsfas',
    url: 'https://upload.wikimedia.org/wikipedia/en/6/60/National_Student_Financial_Aid_Scheme_logo.png',
    ext: 'png',
  },
  {
    id: 'absa',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Absa_Logo.svg/500px-Absa_Logo.svg.png',
    ext: 'png',
  },
  {
    id: 'nedbank',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Nedbank_logo_small.jpg',
    ext: 'jpg',
  },
  {
    id: 'fnb',
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bc/FirstRand_English_Logo.svg/500px-FirstRand_English_Logo.svg.png',
    ext: 'png',
  },
  {
    id: 'standard-bank',
    url: 'https://icon.horse/icon/standardbank.co.za',
    ext: 'png',
  },
  {
    id: 'sasol',
    url: 'https://companieslogo.com/img/orig/SSL_BIG-b85eb681.png?t=1720244494&download=true',
    ext: 'png',
  },
  {
    id: 'investec',
    url: 'https://upload.wikimedia.org/wikipedia/en/e/e0/Investec_logo.svg',
    ext: 'svg',
  },
  {
    id: 'shoprite',
    url: 'https://companieslogo.com/img/orig/SHP.JO-f9b5c24d.png?t=1720244493&download=true',
    ext: 'png',
  },
  {
    id: 'old-mutual',
    url: 'https://companieslogo.com/img/orig/OMU.JO-4aa2b32b.png?t=1720244493&download=true',
    ext: 'png',
  },
  {
    id: 'allan-gray',
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Allan_Gray_logo.svg/500px-Allan_Gray_logo.svg.png',
    ext: 'png',
  },
  {
    id: 'funza-lushaka',
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/DHEAT_logo.svg/500px-DHEAT_logo.svg.png',
    ext: 'png',
  },
  {
    id: 'nyda',
    url: 'https://icon.horse/icon/nyda.gov.za',
    ext: 'png',
  },
  {
    id: 'eskom',
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/Eskom_%28logo%29.svg/500px-Eskom_%28logo%29.svg.png',
    ext: 'png',
  },
  {
    id: 'transnet',
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Transnet_logo.svg/500px-Transnet_logo.svg.png',
    ext: 'png',
  },
  {
    id: 'thuthuka',
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/South_African_Institute_of_Chartered_Accountants_logo.svg/500px-South_African_Institute_of_Chartered_Accountants_logo.svg.png',
    ext: 'png',
  },
]

fs.mkdirSync(outDir, { recursive: true })

for (const logo of logos) {
  try {
    const res = await fetch(logo.url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'ApplyOnceLogoBot/1.0 (logo asset sync)' },
    })
    if (!res.ok) {
      console.error(`FAILED ${logo.id}: HTTP ${res.status}`)
      continue
    }
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 400) {
      console.error(`FAILED ${logo.id}: file too small (${buf.length}b)`)
      continue
    }
    fs.writeFileSync(path.join(outDir, `${logo.id}.${logo.ext}`), buf)
    console.log(`ok ${logo.id}.${logo.ext} (${buf.length}b)`)
  } catch (err) {
    console.error(`FAILED ${logo.id}: ${err.message}`)
  }
}

// Remove stale duplicate assets from earlier attempts.
for (const stale of ['absa.svg', 'investec.png']) {
  const p = path.join(outDir, stale)
  if (fs.existsSync(p)) {
    fs.unlinkSync(p)
    console.log(`removed stale ${stale}`)
  }
}
