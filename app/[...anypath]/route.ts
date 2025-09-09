import { fetchFile } from "./fetch-file"
import { buildCorsHeaders, handleOptions } from "./cors"

export const GET = async (req: Request) => {
  const { pathname } = new URL(req.url)

  if (!pathname) {
    return new Response("Missing path parameter", { status: 400 })
  }

  const { body, contentType, status } = await fetchFile(pathname)
  const headers = buildCorsHeaders(req, contentType)

  return new Response(body, { status, headers })
}

export const OPTIONS = (req: Request) => handleOptions(req)
