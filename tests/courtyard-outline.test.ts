import { expect, test } from "bun:test"
import { convertKicadModToCircuitJson } from "../lib/kicad-converter"

// Minimal TL3342 geometry from KiCad: four independent courtyard lines and
// four pads. Importers must assemble the lines before Core receives a polygon.
// https://github.com/tscircuit/core/issues/4772
const footprint = `(footprint "SW_SPST_TL3342" (layer "F.Cu")
  (fp_line (start -4.25 -3) (end 4.25 -3) (stroke (width 0.05) (type default)) (layer "F.CrtYd"))
  (fp_line (start -4.25 3) (end -4.25 -3) (stroke (width 0.05) (type default)) (layer "F.CrtYd"))
  (fp_line (start 4.25 -3) (end 4.25 3) (stroke (width 0.05) (type default)) (layer "F.CrtYd"))
  (fp_line (start 4.25 3) (end -4.25 3) (stroke (width 0.05) (type default)) (layer "F.CrtYd"))
  (pad "1" smd rect (at -3.15 -1.9) (size 1.7 1) (layers "F.Cu" "F.Paste" "F.Mask"))
  (pad "1" smd rect (at 3.15 -1.9) (size 1.7 1) (layers "F.Cu" "F.Paste" "F.Mask"))
  (pad "2" smd rect (at -3.15 1.9) (size 1.7 1) (layers "F.Cu" "F.Paste" "F.Mask"))
  (pad "2" smd rect (at 3.15 1.9) (size 1.7 1) (layers "F.Cu" "F.Paste" "F.Mask"))
)`

test("converts TL3342 courtyard lines into one complete polygon", async () => {
  const result = await convertKicadModToCircuitJson(footprint)
  expect(result.success).toBe(true)
  const courtyards =
    result.data?.filter(
      (element) => element.type === "pcb_courtyard_outline",
    ) ?? []
  expect(courtyards).toHaveLength(1)
  const courtyard = courtyards[0]
  if (!courtyard || courtyard.type !== "pcb_courtyard_outline") {
    throw new Error("Expected a complete courtyard outline")
  }
  expect(courtyard.layer).toBe("top")
  expect(courtyard.outline).toHaveLength(4)
  expect(courtyard.outline).toEqual(
    expect.arrayContaining([
      { x: -4.25, y: -3 },
      { x: -4.25, y: 3 },
      { x: 4.25, y: -3 },
      { x: 4.25, y: 3 },
    ]),
  )
  const twiceArea = courtyard.outline.reduce((sum, point, index, points) => {
    const next = points[(index + 1) % points.length]!
    return sum + point.x * next.y - next.x * point.y
  }, 0)
  expect(Math.abs(twiceArea) / 2).toBe(51)
  expect(
    result.data?.filter((element) => element.type === "pcb_smtpad"),
  ).toHaveLength(4)
})
