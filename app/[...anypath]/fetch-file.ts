import {
  convertKicadModToCircuitJson,
  isValidKicadMod,
} from "../../lib/kicad-converter"

export interface FetchResult {
  body: string
  contentType: string
  status: number
}

export const fetchFile = async (pathname: string): Promise<FetchResult> => {
  const convertToCircuitJson = pathname.endsWith(".circuit.json")
  const isKicadMod = pathname.endsWith("kicad_mod")
  const isWrl = pathname.endsWith(".wrl")

  if (!isKicadMod && !convertToCircuitJson && !isWrl) {
    return {
      body: "Invalid path parameter",
      contentType: "text/plain",
      status: 400,
    }
  }

  let fetchPath = convertToCircuitJson
    ? pathname.replace(".circuit.json", ".kicad_mod")
    : pathname

  let gitlabUrl = ""
  let contentType = "text/plain"

  if (isKicadMod || convertToCircuitJson) {
    const parts = fetchPath.split("/")
    if (parts.length >= 3) {
      const firstSegmentIndex = 1
      if (
        parts[firstSegmentIndex] &&
        !parts[firstSegmentIndex].endsWith(".pretty")
      ) {
        parts[firstSegmentIndex] = `${parts[firstSegmentIndex]}.pretty`
        fetchPath = parts.join("/")
      }
    }

    gitlabUrl = `https://gitlab.com/kicad/libraries/kicad-footprints/-/raw/master${fetchPath}?ref_type=heads`
  } else if (isWrl) {
    const parts = fetchPath.split("/")
    if (parts.length >= 3) {
      const firstSegmentIndex = 1
      if (
        parts[firstSegmentIndex] &&
        !parts[firstSegmentIndex].endsWith(".3dshapes")
      ) {
        parts[firstSegmentIndex] = `${parts[firstSegmentIndex]}.3dshapes`
        fetchPath = parts.join("/")
      }
    }

    gitlabUrl = `https://gitlab.com/kicad/libraries/kicad-packages3D/-/raw/master${fetchPath}?ref_type=heads`
    contentType = "model/vrml"
  }

  const res = await fetch(gitlabUrl)

  if (!res.ok) {
    return {
      body: "Couldn't find file",
      contentType: "text/plain",
      status: res.status,
    }
  }

  let responseContent = await res.text()

  if (convertToCircuitJson) {
    if (!isValidKicadMod(responseContent)) {
      return {
        body: "Invalid KiCad mod file format",
        contentType: "text/plain",
        status: 400,
      }
    }

    const conversionResult = await convertKicadModToCircuitJson(responseContent)

    if (!conversionResult.success) {
      return {
        body: `Conversion error: ${conversionResult.error}`,
        contentType: "text/plain",
        status: 500,
      }
    }

    responseContent = JSON.stringify(conversionResult.data, null, 2)
    contentType = "application/json"
  }

  return { body: responseContent, contentType, status: 200 }
}
