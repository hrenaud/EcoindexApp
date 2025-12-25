/**
 * Convert Version to string (shared util safe for renderer and main)
 */
export const convertVersion = (version: string) => {
    return version.replace(/\./gm, '_').replace(/-/gm, '_')
}
