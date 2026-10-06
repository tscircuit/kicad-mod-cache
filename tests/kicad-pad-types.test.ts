import { expect, test } from "bun:test"
import { convertKicadModToCircuitJson } from "../lib/kicad-converter"

// Tag-Connect style: "connect" pads are surface copper contacts with no paste
// and no drill (Connector:Tag-Connect_TC2030-IDC-NL_2x03_P1.27mm_Vertical).
const connectPadsKicadMod = `(footprint "Test:ConnectPads" (version 20240108) (generator "pcbnew") (layer "F.Cu")
  (attr smd)
  (pad "" np_thru_hole circle (at -2.54 0) (size 0.9906 0.9906) (drill 0.9906) (layers "*.Cu" "*.Mask"))
  (pad "1" connect circle (at -1.27 0.635) (size 0.7874 0.7874) (layers "F.Cu" "F.Mask"))
  (pad "2" connect circle (at -1.27 -0.635) (size 0.7874 0.7874) (layers "F.Cu" "F.Mask"))
)`

// JST ZE style: pin 1 is a "thru_hole custom" pad.
const customThruHolePadKicadMod = `(footprint "Test:CustomThruHole" (version 20240108) (generator "pcbnew") (layer "F.Cu")
  (attr through_hole)
  (pad "1" thru_hole custom (at 0 0) (size 0.7 0.7) (drill 0.7) (layers "*.Cu" "*.Mask")
    (options (clearance outline) (anchor circle))
    (primitives (gr_poly (pts (xy -0.5 -0.6) (xy 0.5 -0.6) (xy 0.5 0.6) (xy -0.5 0.6)) (width 0) (fill yes)))
  )
  (pad "2" thru_hole oval (at 1.5 0) (size 1 1.2) (drill 0.7) (layers "*.Cu" "*.Mask"))
)`

test("connect pads become SMT pads, not drilled holes", async () => {
  const result = await convertKicadModToCircuitJson(connectPadsKicadMod)
  expect(result.success).toBe(true)
  const types = result.data!.map((element) => element.type)
  expect(types.filter((type) => type === "pcb_smtpad")).toHaveLength(2)
  expect(types.filter((type) => type === "pcb_plated_hole")).toHaveLength(0)
  expect(types.filter((type) => type === "pcb_hole")).toHaveLength(1)
})

test("thru_hole custom pads are kept", async () => {
  const result = await convertKicadModToCircuitJson(customThruHolePadKicadMod)
  expect(result.success).toBe(true)
  const platedHoles = result.data!.filter(
    (element) => element.type === "pcb_plated_hole",
  )
  expect(platedHoles).toHaveLength(2)
})
