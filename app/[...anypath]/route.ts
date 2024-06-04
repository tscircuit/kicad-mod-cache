export const GET = async (req) => {
  const { pathname } = new URL(req.url)

  // Check if the parameter is provided
  if (!pathname) {
    return new Response("Missing path parameter", { status: 400 })
  }

  if (!pathname.endsWith("kicad_mod")) {
    return new Response("Invalid path parameter", { status: 400 })
  }

  // Construct the GitLab URL using the extracted parameter
  const gitlabUrl = `https://gitlab.com/kicad/libraries/kicad-footprints/-/raw/master${pathname}?ref_type=heads`

  // Fetch the content from GitLab
  const res = await fetch(gitlabUrl)

  // Check if the fetch was successful
  if (!res.ok) {
    return new Response("Couldn't find file", { status: res.status })
  }

  const headers = new Headers(res.headers)
  headers.set("Cache-Control", "s-maxage=86400, stale-while-revalidate=86400")

  // Add CORS headers
  headers.set(
    "Access-Control-Allow-Origin",
    "https://github.io, https://tscircuit.com, http://localhost:3000, http://localhost:5173"
  )
  headers.set("Access-Control-Allow-Methods", "GET")
  headers.set("Access-Control-Allow-Headers", "Content-Type")

  // Return the fetched response with caching and CORS headers
  return new Response(await res.text(), {
    status: res.status,
    headers: headers,
  })
}

export const OPTIONS = async (req) => {
  // Add CORS headers
  const headers = new Headers()
  headers.set(
    "Access-Control-Allow-Origin",
    "https://github.io, https://tscircuit.com, http://localhost:3000, http://localhost:5173"
  )
  headers.set("Access-Control-Allow-Methods", "GET")
  headers.set("Access-Control-Allow-Headers", "Content-Type")

  return new Response(null, {
    status: 200,
    headers: headers,
  })
}
