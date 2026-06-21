import { KicadFootprintToCircuitJsonConverter } from "kicad-to-circuit-json"

const KICAD_MOD_FILE_NAME = "footprint.kicad_mod"

function normalizeLegacyKicadMod(content: string) {
  return content.replace(/^(\s*)\(module\b/, "$1(footprint")
}

/**
 * Converts KiCad mod file content to circuit.json format
 */
export async function convertKicadModToCircuitJson(kicadModContent: string) {
  try {
    // Pre-validate content before attempting conversion
    if (!kicadModContent.trim()) {
      throw new Error("Empty content provided")
    }

    const converter = new KicadFootprintToCircuitJsonConverter()
    converter.addFile(
      KICAD_MOD_FILE_NAME,
      normalizeLegacyKicadMod(kicadModContent),
    )
    converter.runUntilFinished()

    const circuitJson = converter.getOutput()
    return {
      success: true,
      data: circuitJson,
      error: null,
    }
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.message || String(error) || "Unknown conversion error",
    }
  }
}

/**
 * Validates if content appears to be a valid KiCad mod file
 */
export function isValidKicadMod(content: string): boolean {
  return (
    content.trim().startsWith("(module") ||
    content.trim().startsWith("(footprint")
  )
}
