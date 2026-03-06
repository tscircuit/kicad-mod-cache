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
  const isStep = pathname.endsWith(".step")

  if (!isKicadMod && !convertToCircuitJson && !isWrl && !isStep) {
    return {
      body: "Invalid path parameter",
      contentType: "text/plain",
      status: 400,
    }
  }

  const requestedPath = convertToCircuitJson
    ? pathname.replace(".circuit.json", ".kicad_mod")
    : pathname

  let fetchPathCandidates: Array<{ path: string; contentType: string }> = []
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

    fetchPathCandidates = [
      { path: withPretty.join("/"), contentType: "text/plain" },
      { path: requestedPath, contentType: "text/plain" },
    ]

    gitlabBaseUrl =
      "https://gitlab.com/kicad/libraries/kicad-footprints/-/raw/master"
  } else if (isWrl || isStep) {
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

    const with3dShapesPath = with3dShapes.join("/")
    const fallbackStepPath = isWrl
      ? requestedPath.replace(/\.wrl$/i, ".step")
      : requestedPath
    const fallbackStepWith3dShapesPath = isWrl
      ? with3dShapesPath.replace(/\.wrl$/i, ".step")
      : with3dShapesPath

    fetchPathCandidates = [
      { path: with3dShapesPath, contentType: "model/vrml" },
      { path: requestedPath, contentType: "model/vrml" },
    ]

    if (isWrl) {
      fetchPathCandidates.push(
        { path: fallbackStepWith3dShapesPath, contentType: "model/step" },
        { path: fallbackStepPath, contentType: "model/step" },
      )
    } else {
      fetchPathCandidates[0]!.contentType = "model/step"
      fetchPathCandidates[1]!.contentType = "model/step"
    }

    gitlabBaseUrl =
      "https://gitlab.com/kicad/libraries/kicad-packages3D/-/raw/master"
  }

  const uniqueCandidates = Array.from(
    new Map(
      fetchPathCandidates.map((candidate) => [candidate.path, candidate]),
    ).values(),
  )
  let res: Awaited<ReturnType<typeof fetch>> | null = null

  for (const pathCandidate of uniqueCandidates) {
    const encodedPath = pathCandidate.path
      .split("/")
      .map((segment, index) =>
        index === 0 || segment === "" ? segment : encodeURIComponent(segment),
      )
      .join("/")
    const gitlabUrl = `${gitlabBaseUrl}${encodedPath}?ref_type=heads`
    const attempt = await fetch(gitlabUrl)

    if (attempt.ok) {
      res = attempt
      contentType = pathCandidate.contentType
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
