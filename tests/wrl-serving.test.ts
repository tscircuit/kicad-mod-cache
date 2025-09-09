import { expect, test } from "bun:test"
import { GET } from "../app/[...anypath]/route"

test("serves wrl files from packages3D repo", async () => {
  const expectedUrl =
    "https://gitlab.com/kicad/libraries/kicad-packages3D/-/raw/master/Battery.3dshapes/BatteryClip.wrl?ref_type=heads"
  const originalFetch = global.fetch
  global.fetch = (async (url: RequestInfo) => {
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
