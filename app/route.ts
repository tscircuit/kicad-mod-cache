export const GET = (req) => {
  return new Response(`<html><body>
  
  This server caches official kicad mod files, here is the <a href="https://gitlab.com/kicad/libraries/kicad-footprints/-/blob/master/LICENSE.md?ref_type=heads">license file</a> and <a href="https://gitlab.com/kicad/libraries/kicad-footprints">original repo</a>
  
  </body></html>`)
}
