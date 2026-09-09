const LINK_TIMEOUT_MS = 8000
const RECHECK_AFTER_MS = 20 * 60 * 60 * 1000
const USER_AGENT = 'ApplyOnceCatalogueCheck/1.0 (+https://applyonce.org)'

function isHttpUrl(raw) {
  try {
    const u = new URL(String(raw || '').trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Probe an apply URL. Does not download the body.
 * @param {string} url
 */
export async function checkApplyUrl(url) {
  if (!url || !String(url).trim()) {
    return { linkStatus: 'no_url', linkStatusDetail: 'No apply URL on file', dead: false }
  }
  if (!isHttpUrl(url)) {
    return { linkStatus: 'error', linkStatusDetail: 'URL must start with http or https', dead: true }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LINK_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    // Drain a little so the socket can close cleanly, then abort.
    try {
      await res.body?.cancel?.()
    } catch {
      /* ignore */
    }
    const status = res.status
    if (status === 404 || status === 410) {
      return { linkStatus: 'dead', linkStatusDetail: `HTTP ${status}`, dead: true }
    }
    if (status >= 200 && status < 400) {
      return { linkStatus: 'ok', linkStatusDetail: `HTTP ${status}`, dead: false }
    }
    if (status === 401 || status === 403 || status === 405 || status === 429) {
      return {
        linkStatus: 'ok',
        linkStatusDetail: `HTTP ${status} (site responded; may block bots)`,
        dead: false,
      }
    }
    if (status >= 500) {
      return { linkStatus: 'error', linkStatusDetail: `HTTP ${status}`, dead: false }
    }
    return { linkStatus: 'error', linkStatusDetail: `HTTP ${status}`, dead: false }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const aborted = /abort/i.test(msg)
    return {
      linkStatus: aborted ? 'error' : 'dead',
      linkStatusDetail: aborted ? 'Timed out' : msg.slice(0, 180),
      dead: !aborted,
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * @param {import('@prisma/client').BursaryOpportunity} row
 * @param {Date} now
 * @param {{ force?: boolean }} [opts]
 */
export function shouldProbeLink(row, now, opts = {}) {
  if (opts.force) return true
  if (!row.lastCheckedAt) return true
  return now.getTime() - new Date(row.lastCheckedAt).getTime() >= RECHECK_AFTER_MS
}

/**
 * Daily desk pass: probe apply URLs and flag dead/missing links.
 * Status (open / upcoming / closed) is calculated from dates on read — we never invent
 * opening dates, and we do not unpublish a listing just because it closed.
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {{ force?: boolean, limit?: number }} [opts]
 */
export async function runBursaryHealthCheck(prisma, opts = {}) {
  const now = new Date()
  const rows = await prisma.bursaryOpportunity.findMany({
    orderBy: [{ applicationCloses: 'asc' }, { name: 'asc' }],
  })
  const limit = Number(opts.limit) > 0 ? Number(opts.limit) : rows.length
  const slice = rows.slice(0, limit)
  const CONCURRENCY = 8
  let checked = 0
  let probed = 0
  let flagged = 0
  let closedByDate = 0

  for (let i = 0; i < slice.length; i += CONCURRENCY) {
    const batch = slice.slice(i, i + CONCURRENCY)
    const results = await Promise.all(
      batch.map(async (row) => {
        const datePassed = new Date(row.applicationCloses).getTime() < now.getTime()
        let link = {
          linkStatus: row.linkStatus || 'unknown',
          linkStatusDetail: row.linkStatusDetail || null,
          dead: row.linkStatus === 'dead',
        }
        const probe = shouldProbeLink(row, now, opts)
        if (probe) {
          link = await checkApplyUrl(row.applyUrl)
        }
        const needsReview = Boolean(
          row.active && (link.dead || link.linkStatus === 'no_url' || link.linkStatus === 'error'),
        )
        return { row, probe, link, needsReview, datePassed }
      }),
    )

    for (const item of results) {
      if (item.probe) probed += 1
      if (item.needsReview) flagged += 1
      if (item.datePassed) closedByDate += 1
      await prisma.bursaryOpportunity.update({
        where: { id: item.row.id },
        data: {
          lastCheckedAt: item.probe ? now : item.row.lastCheckedAt,
          linkStatus: item.link.linkStatus,
          linkStatusDetail: item.link.linkStatusDetail,
          needsReview: item.needsReview,
        },
      })
      checked += 1
    }
  }

  return {
    asOf: now.toISOString(),
    checked,
    probed,
    flagged,
    closedByDate,
    total: rows.length,
  }
}
