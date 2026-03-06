import { expect, test } from "bun:test"
import { GET } from "../app/[...anypath]/route"

test("serves wrl files from packages3D repo", async () => {
  const expectedUrl =
    "https://gitlab.com/kicad/libraries/kicad-packages3D/-/raw/master/Battery.3dshapes/BatteryClip.wrl?ref_type=heads"
  const originalFetch = global.fetch
  global.fetch = (async (url: string | URL) => {
    expect(url).toBe(expectedUrl)
    return new Response("wrl content")
  }) as any

  const req = new Request("http://localhost/Battery/BatteryClip.wrl")
  const res = await GET(req)
  const text = await res.text()

  expect(text).toBe("wrl content")
  expect(res.headers.get("Content-Type")).toBe("model/vrml")

  global.fetch = originalFetch
})

test("falls back to raw path if .pretty expansion 404s", async () => {
  const originalFetch = global.fetch
  const requests: string[] = []

  global.fetch = (async (url: string | URL) => {
    requests.push(String(url))

    if (requests.length === 1) {
      return new Response("missing", { status: 404 })
    }

    return new Response("footprint content", { status: 200 })
  }) as any

  const req = new Request(
    "http://localhost/Resistor_SMD/R_0402_1005Metric.kicad_mod",
  )
  const res = await GET(req)

  expect(res.status).toBe(200)
  expect(await res.text()).toBe("footprint content")
  expect(requests).toEqual([
    "https://gitlab.com/kicad/libraries/kicad-footprints/-/raw/master/Resistor_SMD.pretty/R_0402_1005Metric.kicad_mod?ref_type=heads",
    "https://gitlab.com/kicad/libraries/kicad-footprints/-/raw/master/Resistor_SMD/R_0402_1005Metric.kicad_mod?ref_type=heads",
  ])

  global.fetch = originalFetch
})

test("encodes path segments before fetching", async () => {
  const originalFetch = global.fetch
  const requests: string[] = []

  global.fetch = (async (url: string | URL) => {
    requests.push(String(url))
    return new Response("footprint content", { status: 200 })
  }) as any

  const req = new Request(
    "http://localhost/Connector_Phoenix_GMSTB/PhoenixContact_GMSTBA_2,5_10-G-7,62_1x10_P7.62mm_Horizontal.kicad_mod",
  )
  const res = await GET(req)

  expect(res.status).toBe(200)
  expect(requests[0]).toBe(
    "https://gitlab.com/kicad/libraries/kicad-footprints/-/raw/master/Connector_Phoenix_GMSTB.pretty/PhoenixContact_GMSTBA_2%2C5_10-G-7%2C62_1x10_P7.62mm_Horizontal.kicad_mod?ref_type=heads",
  )

  global.fetch = originalFetch
})
