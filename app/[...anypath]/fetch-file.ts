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

  const requestedPath = convertToCircuitJson
    ? pathname.replace(".circuit.json", ".kicad_mod")
    : pathname

  let fetchPathCandidates: string[] = []
  let gitlabBaseUrl = ""
  let contentType = "text/plain"

  if (isKicadMod || convertToCircuitJson) {
    const parts = requestedPath.split("/")
    const withPretty = [...parts]
    if (parts.length >= 3) {
      const firstSegmentIndex = 1
      if (
        withPretty[firstSegmentIndex] &&
        !withPretty[firstSegmentIndex].endsWith(".pretty")
      ) {
        withPretty[firstSegmentIndex] =
          `${withPretty[firstSegmentIndex]}.pretty`
      }
    }

    fetchPathCandidates = [withPretty.join("/"), requestedPath]

    gitlabBaseUrl =
      "https://gitlab.com/kicad/libraries/kicad-footprints/-/raw/master"
  } else if (isWrl) {
    const parts = requestedPath.split("/")
    const with3dShapes = [...parts]
    if (parts.length >= 3) {
      const firstSegmentIndex = 1
      if (
        with3dShapes[firstSegmentIndex] &&
        !with3dShapes[firstSegmentIndex].endsWith(".3dshapes")
      ) {
        with3dShapes[firstSegmentIndex] =
          `${with3dShapes[firstSegmentIndex]}.3dshapes`
      }
    }

    fetchPathCandidates = [with3dShapes.join("/"), requestedPath]

    gitlabBaseUrl =
      "https://gitlab.com/kicad/libraries/kicad-packages3D/-/raw/master"
    contentType = "model/vrml"
  }

  const uniqueCandidates = [...new Set(fetchPathCandidates)]
  let res: Awaited<ReturnType<typeof fetch>> | null = null

  for (const pathCandidate of uniqueCandidates) {
    const encodedPath = pathCandidate
      .split("/")
      .map((segment, index) =>
        index === 0 || segment === "" ? segment : encodeURIComponent(segment),
      )
      .join("/")
    const gitlabUrl = `${gitlabBaseUrl}${encodedPath}?ref_type=heads`
    const attempt = await fetch(gitlabUrl)

    if (attempt.ok) {
      res = attempt
      break
    }

    if (res === null) {
      res = attempt
    }
  }

  if (!res?.ok) {
    return {
      body: "Couldn't find file",
      contentType: "text/plain",
      status: res?.status ?? 404,
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
