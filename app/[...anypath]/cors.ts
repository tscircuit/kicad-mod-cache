export const buildCorsHeaders = (
  req: Request,
  contentType: string,
): Headers => {
  const headers = new Headers()
  headers.set("Cache-Control", "s-maxage=86400, stale-while-revalidate=86400")
  headers.set("Content-Type", contentType)

  const origin = req.headers.get("origin") || "*"
  headers.set("Access-Control-Allow-Origin", origin)
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "Content-Type")
  headers.set("Vary", "Origin")

  return headers
}

export const handleOptions = (req: Request): Response => {
  const headers = new Headers()
  const origin = req.headers.get("origin") || "*"
  const reqMethod = req.headers.get("access-control-request-method") || "GET"
  const reqHeaders =
    req.headers.get("access-control-request-headers") || "Content-Type"

  headers.set("Access-Control-Allow-Origin", origin)
  headers.set("Access-Control-Allow-Methods", `${reqMethod}, OPTIONS`)
  headers.set("Access-Control-Allow-Headers", reqHeaders)
  headers.set("Access-Control-Max-Age", "86400")
  headers.set(
    "Vary",
    "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
  )

  headers.set("Access-Control-Allow-Private-Network", "true")

  return new Response(null, { status: 204, headers })
}
