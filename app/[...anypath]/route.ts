import { convertKicadModToCircuitJson, isValidKicadMod } from "../../lib/kicad-converter"

export const GET = async (req) => {
  const { pathname, searchParams } = new URL(req.url)

  // Check if the parameter is provided
  if (!pathname) {
    return new Response("Missing path parameter", { status: 400 })
  }

  if (!pathname.endsWith("kicad_mod")) {
    return new Response("Invalid path parameter", { status: 400 })
  }

  // Check if circuit.json conversion is requested
  const convertToCircuitJson = searchParams.get("format") === "circuit_json"

  // Construct the GitLab URL using the extracted parameter
  const gitlabUrl = `https://gitlab.com/kicad/libraries/kicad-footprints/-/raw/master${pathname}?ref_type=heads`

  // Fetch the content from GitLab
  const res = await fetch(gitlabUrl)

  // Check if the fetch was successful
  if (!res.ok) {
    return new Response("Couldn't find file", { status: res.status })
  }

  const kicadModContent = await res.text()
  
  let responseContent = kicadModContent
  let contentType = "text/plain"

  // Convert to circuit.json if requested
  if (convertToCircuitJson) {
    if (!isValidKicadMod(kicadModContent)) {
      return new Response("Invalid KiCad mod file format", { status: 400 })
    }
    
    const conversionResult = convertKicadModToCircuitJson(kicadModContent)
    
    if (!conversionResult.success) {
      return new Response(`Conversion error: ${conversionResult.error}`, { status: 500 })
    }
    
    responseContent = JSON.stringify(conversionResult.data, null, 2)
    contentType = "application/json"
  }

  const headers = new Headers()
  headers.set("Cache-Control", "s-maxage=86400, stale-while-revalidate=86400")
  headers.set("Content-Type", contentType)

  // Add CORS headers
  headers.set("Access-Control-Allow-Origin", req.headers.get("Origin"))
  headers.set("Access-Control-Allow-Private-Network", "true")
  headers.set("Access-Control-Allow-Methods", "GET")
  headers.set("Access-Control-Allow-Headers", "Content-Type")

  // Return the response with caching and CORS headers
  return new Response(responseContent, {
    status: 200,
    headers: headers,
  })
}

export const OPTIONS = async (req) => {
  // Add CORS headers
  const headers = new Headers()
  headers.set("Access-Control-Allow-Origin", req.headers.get("Origin"))
  headers.set("Access-Control-Allow-Methods", "GET")
  headers.set("Access-Control-Allow-Private-Network", "true")
  headers.set("Access-Control-Allow-Headers", "Content-Type")

  return new Response(null, {
    status: 200,
    headers: headers,
  })
}
