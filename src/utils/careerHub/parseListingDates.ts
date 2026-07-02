const MONTH_MAP: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

function toIso(year: number, month: number, day = 1): string {
  const d = new Date(Date.UTC(year, month, day))
  return d.toISOString().slice(0, 10)
}

function lastDayOfMonth(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month + 1, 0))
  return d.toISOString().slice(0, 10)
}

function parseMonthToken(token: string): number | null {
  const key = token.trim().toLowerCase().replace(/\./g, '')
  return MONTH_MAP[key] ?? null
}

function parseIsoInText(text: string): string | null {
  const match = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  return match ? match[0] : null
}

function parseMonthYear(text: string): string | null {
  const match = text.match(/\b([A-Za-z]{3,9})\s+(20\d{2})\b/)
  if (!match) return null
  const month = parseMonthToken(match[1])
  if (month == null) return null
  return toIso(Number(match[2]), month, 1)
}

function parseMonthRangeYear(text: string): { opensOn: string; closesOn: string } | null {
  const match = text.match(/\b([A-Za-z]{3,9})\s*[–-]\s*([A-Za-z]{3,9})\s+(20\d{2})\b/i)
  if (!match) return null
  const startMonth = parseMonthToken(match[1])
  const endMonth = parseMonthToken(match[2])
  const year = Number(match[3])
  if (startMonth == null || endMonth == null) return null
  return {
    opensOn: toIso(year, startMonth, 1),
    closesOn: lastDayOfMonth(year, endMonth),
  }
}

function parseQuarter(text: string): string | null {
  const match = text.match(/\bQ([1-4])\s+(20\d{2})\b/i)
  if (!match) return null
  const quarter = Number(match[1])
  const year = Number(match[2])
  const month = (quarter - 1) * 3
  return toIso(year, month, 1)
}

export function parseListingDates(
  applicationOpens: string,
  applicationCloses: string,
  overrides?: { opensOn?: string | null; closesOn?: string | null },
): { opensOn: string | null; closesOn: string | null } {
  if (overrides?.opensOn) {
    return {
      opensOn: overrides.opensOn,
      closesOn: overrides.closesOn ?? parseIsoInText(applicationCloses) ?? parseMonthYear(applicationCloses),
    }
  }

  const combined = `${applicationOpens} ${applicationCloses}`
  const range = parseMonthRangeYear(applicationOpens) ?? parseMonthRangeYear(applicationCloses)
  if (range) return range

  const opensOn =
    parseIsoInText(applicationOpens) ??
    parseMonthYear(applicationOpens) ??
    parseQuarter(applicationOpens) ??
    parseQuarter(combined)

  const closesOn =
    parseIsoInText(applicationCloses) ??
    parseMonthYear(applicationCloses) ??
    (opensOn && parseMonthRangeYear(applicationCloses)?.closesOn) ??
    null

  return { opensOn, closesOn }
}

export function formatListingDate(iso: string | null): string | null {
  if (!iso) return null
  try {
    const d = new Date(`${iso}T12:00:00Z`)
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}
