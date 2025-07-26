import { parseKicadModToCircuitJson } from "kicad-component-converter";

/**
 * Converts KiCad mod file content to circuit.json format
 */
export async function convertKicadModToCircuitJson(kicadModContent: string) {
	try {
		// Pre-validate content before attempting conversion
		if (!kicadModContent.trim()) {
			throw new Error("Empty content provided");
		}

		const circuitJson = await parseKicadModToCircuitJson(kicadModContent);
		return {
			success: true,
			data: circuitJson,
			error: null,
		};
	} catch (error: any) {
		return {
			success: false,
			data: null,
			error: error?.message || String(error) || "Unknown conversion error",
		};
	}
}

/**
 * Validates if content appears to be a valid KiCad mod file
 */
export function isValidKicadMod(content: string): boolean {
	return (
		content.trim().startsWith("(module") ||
		content.trim().startsWith("(footprint")
	);
}
