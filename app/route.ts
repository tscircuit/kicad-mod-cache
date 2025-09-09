export const GET = (req: Request) => {
  const headers = new Headers({
    "Content-Type": "text/html",
  })
  const origin = req.headers.get("origin") || "*"
  headers.set("Access-Control-Allow-Origin", origin)
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "Content-Type")
  headers.set("Vary", "Origin")

  return new Response(
    `<html><body>

  This server caches official kicad mod and 3D model (wrl) files.<br/>
  Footprints: <a href="https://gitlab.com/kicad/libraries/kicad-footprints/-/blob/master/LICENSE.md?ref_type=heads">license file</a> and <a href="https://gitlab.com/kicad/libraries/kicad-footprints">original repo</a><br/>
  3D models: <a href="https://gitlab.com/kicad/libraries/kicad-packages3D/-/blob/master/LICENSE.md?ref_type=heads">license file</a> and <a href="https://gitlab.com/kicad/libraries/kicad-packages3D">original repo</a>
    <p>
    Example footprint: <a href="/Resistor_SMD/R_0402_1005Metric.kicad_mod">/Resistor_SMD/R_0402_1005Metric.kicad_mod</a>
    </p>
    <p>
    Example circuit json: <a href="/Resistor_SMD/R_0402_1005Metric.circuit.json">/Resistor_SMD/R_0402_1005Metric.circuit.json</a>
    </p>
    <p>
    Example 3D model: <a href="/Battery/BatteryClip.wrl">/Battery/BatteryClip.wrl</a>
    </p>

  </body></html>`,
    {
      headers,
    },
  )
}

export const OPTIONS = (req: Request) => {
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

  return new Response(null, { status: 204, headers })
}
