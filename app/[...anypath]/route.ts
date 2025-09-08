import {
	convertKicadModToCircuitJson,
	isValidKicadMod,
} from "../../lib/kicad-converter";

export const GET = async (req) => {
	const { pathname, searchParams } = new URL(req.url);

	// Check if the parameter is provided
	if (!pathname) {
		return new Response("Missing path parameter", { status: 400 });
	}

	// Check if circuit.json conversion is requested
	const convertToCircuitJson = pathname.endsWith(".circuit.json");

	// Validate path parameter
	if (!pathname.endsWith("kicad_mod") && !pathname.endsWith(".circuit.json")) {
		return new Response("Invalid path parameter", { status: 400 });
	}

	// Convert .circuit.json path to .kicad_mod for fetching
	const kicadModPath = convertToCircuitJson
		? pathname.replace(".circuit.json", ".kicad_mod")
		: pathname;

	// Construct the GitLab URL using the extracted parameter
	const gitlabUrl = `https://gitlab.com/kicad/libraries/kicad-footprints/-/raw/master${kicadModPath}?ref_type=heads`;

	// Fetch the content from GitLab
	const res = await fetch(gitlabUrl);

	// Check if the fetch was successful
	if (!res.ok) {
		return new Response("Couldn't find file", { status: res.status });
	}

	const kicadModContent = await res.text();

	let responseContent = kicadModContent;
	let contentType = "text/plain";

	// Convert to circuit.json if requested
	if (convertToCircuitJson) {
		if (!isValidKicadMod(kicadModContent)) {
			return new Response("Invalid KiCad mod file format", { status: 400 });
		}

		const conversionResult = await convertKicadModToCircuitJson(kicadModContent);

		if (!conversionResult.success) {
			return new Response(`Conversion error: ${conversionResult.error}`, {
				status: 500,
			});
		}

		responseContent = JSON.stringify(conversionResult.data, null, 2);
		contentType = "application/json";
	}

    const headers = new Headers();
    headers.set("Cache-Control", "s-maxage=86400, stale-while-revalidate=86400");
    headers.set("Content-Type", contentType);

    // CORS headers
    const origin = req.headers.get("origin") || "*";
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Vary", "Origin");

	// Return the response with caching and CORS headers
	return new Response(responseContent, {
		status: 200,
		headers: headers,
	});
};

export const OPTIONS = async (req) => {
    // Preflight CORS handling
    const headers = new Headers();
    const origin = req.headers.get("origin") || "*";
    const reqMethod = req.headers.get("access-control-request-method") || "GET";
    const reqHeaders = req.headers.get("access-control-request-headers") || "Content-Type";

    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", `${reqMethod}, OPTIONS`);
    headers.set("Access-Control-Allow-Headers", reqHeaders);
    headers.set("Access-Control-Max-Age", "86400");
    headers.set("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers");

    // Only needed for Private Network Access preflight (Chrome-based)
    headers.set("Access-Control-Allow-Private-Network", "true");

    return new Response(null, {
        status: 204,
        headers,
    });
};
