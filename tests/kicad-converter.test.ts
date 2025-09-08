import { expect, test } from "bun:test"
import {
  convertKicadModToCircuitJson,
  isValidKicadMod,
} from "../lib/kicad-converter"

const validKicadModContent = `(module LED_SMD:LED_0603_1608Metric_Castellated (layer F.Cu) (tedit 5A030A40)
  (descr "LED SMD 0603 (1608 Metric), castellated end terminals, https://www.osram-os.com/Graphics/XPic4/00205340_0.pdf/KW%20CSLNM1.EC")
  (tags "LED castellated")
  (attr smd)
  (fp_text reference REF** (at 0 -1.43) (layer F.SilkS)
    (effects (font (size 1 1) (thickness 0.15)))
  )
  (fp_text value LED_0603_1608Metric_Castellated (at 0 1.43) (layer F.Fab)
    (effects (font (size 1 1) (thickness 0.15)))
  )
)`

const invalidKicadModContent = `This is not a valid KiCad mod file`

test("isValidKicadMod should return true for valid KiCad mod content", () => {
  expect(isValidKicadMod(validKicadModContent)).toBe(true)
})

test("isValidKicadMod should return false for invalid content", () => {
  expect(isValidKicadMod(invalidKicadModContent)).toBe(false)
})

test("isValidKicadMod should handle empty string", () => {
  expect(isValidKicadMod("")).toBe(false)
})

test("isValidKicadMod should handle footprint format", () => {
  const footprintContent = `(footprint "LED_SMD:LED_0603" (version 20221018)`
  expect(isValidKicadMod(footprintContent)).toBe(true)
})

test("convertKicadModToCircuitJson should return success for valid content", async () => {
  const result = await convertKicadModToCircuitJson(validKicadModContent)
  expect(result.success).toBe(true)
  expect(result.data).toBeDefined()
  expect(result.error).toBe(null)
})

// Note: The kicad-mod-converter library has some edge cases with error handling
// These tests focus on the validation and successful conversion paths

test("convertKicadModToCircuitJson should handle empty content", async () => {
  const result = await convertKicadModToCircuitJson("")
  expect(result.success).toBe(false)
  expect(result.data).toBe(null)
  expect(result.error).toBeDefined()
})
