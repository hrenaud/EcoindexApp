#!/usr/bin/env node

/**
 * Script pour générer les fichiers latest-mac.yml, latest.yml et latest-linux.yml
 * nécessaires pour electron-updater avec Electron Forge
 *
 * Ces fichiers sont générés automatiquement par electron-builder,
 * mais doivent être créés manuellement avec Electron Forge.
 */

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join, basename } from 'node:path'

const VERSION = process.env.VERSION || process.argv[2]
const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR || 'artifacts'

if (!VERSION) {
    console.error('❌ Erreur: La version est requise')
    console.error(
        'Usage: node scripts/generate-update-files.js <version> [artifacts-dir]'
    )
    process.exit(1)
}

/**
 * Calcule le hash SHA512 d'un fichier
 */
async function calculateSHA512(filePath) {
    const fileBuffer = readFileSync(filePath)
    const hashSum = createHash('sha512')
    hashSum.update(fileBuffer)
    return hashSum.digest('base64')
}

/**
 * Trouve tous les fichiers dans un répertoire de manière récursive
 */
async function findFiles(dir, extensions) {
    const files = []
    try {
        const entries = await readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
            const fullPath = join(dir, entry.name)
            if (entry.isDirectory()) {
                const subFiles = await findFiles(fullPath, extensions)
                files.push(...subFiles)
            } else if (entry.isFile()) {
                const ext = entry.name.split('.').pop()?.toLowerCase()
                if (extensions.includes(ext)) {
                    files.push(fullPath)
                }
            }
        }
    } catch {
        // Ignorer les erreurs si le répertoire n'existe pas
    }
    return files
}

/**
 * Génère le contenu YAML pour un fichier
 */
function generateYAML(version, files, releaseDate) {
    // Format attendu par electron-updater
    const yaml = {
        version: version,
        files: files,
        path: files[0]?.url || '',
        sha512: files[0]?.sha512 || '',
        releaseDate: releaseDate,
    }

    // Convertir en YAML
    let yamlContent = `version: ${yaml.version}\n`
    yamlContent += `files:\n`
    for (const file of yaml.files) {
        yamlContent += `  - url: ${file.url}\n`
        yamlContent += `    sha512: ${file.sha512}\n`
        yamlContent += `    size: ${file.size}\n`
    }
    yamlContent += `path: ${yaml.path}\n`
    yamlContent += `sha512: ${yaml.sha512}\n`
    yamlContent += `releaseDate: '${yaml.releaseDate}'\n`

    return yamlContent
}

/**
 * Génère les fichiers YAML pour une plateforme
 */
async function generateUpdateFiles(platform, version, artifactsDir) {
    const releaseDate = new Date().toISOString()

    // Définir les extensions de fichiers selon la plateforme
    let extensions = []
    let outputFile = ''

    if (platform === 'darwin') {
        extensions = ['zip', 'dmg']
        outputFile = 'latest-mac.yml'
    } else if (platform === 'win32') {
        extensions = ['zip', 'exe']
        outputFile = 'latest.yml'
    } else if (platform === 'linux') {
        extensions = ['zip', 'deb', 'rpm']
        outputFile = 'latest-linux.yml'
    } else {
        console.error(`❌ Plateforme inconnue: ${platform}`)
        return
    }

    // Trouver les fichiers correspondants
    const files = await findFiles(artifactsDir, extensions)

    if (files.length === 0) {
        console.warn(
            `⚠️  Aucun fichier trouvé pour ${platform} dans ${artifactsDir}`
        )
        return
    }

    // Traiter chaque fichier
    const fileInfos = []
    for (const filePath of files) {
        const fileName = basename(filePath)
        const stats = statSync(filePath)
        const sha512 = await calculateSHA512(filePath)

        // Filtrer selon la plateforme dans le nom du fichier
        if (platform === 'darwin' && !fileName.includes('darwin')) continue
        if (platform === 'win32' && !fileName.includes('win32')) continue
        if (platform === 'linux' && !fileName.includes('linux')) continue

        fileInfos.push({
            url: fileName,
            sha512: sha512,
            size: stats.size,
        })
    }

    if (fileInfos.length === 0) {
        console.warn(
            `⚠️  Aucun fichier valide trouvé pour ${platform} après filtrage`
        )
        return
    }

    // Générer le YAML
    const yamlContent = generateYAML(version, fileInfos, releaseDate)

    // Écrire le fichier
    const outputPath = join(artifactsDir, outputFile)
    writeFileSync(outputPath, yamlContent, 'utf8')

    console.log(`✅ Généré ${outputFile} pour ${platform}`)
    console.log(`   Fichiers: ${fileInfos.map((f) => f.url).join(', ')}`)
}

/**
 * Fonction principale
 */
async function main() {
    console.log(
        `📦 Génération des fichiers de mise à jour pour la version ${VERSION}`
    )
    console.log(`   Répertoire des artefacts: ${ARTIFACTS_DIR}\n`)

    // Générer les fichiers pour chaque plateforme
    await generateUpdateFiles('darwin', VERSION, ARTIFACTS_DIR)
    await generateUpdateFiles('win32', VERSION, ARTIFACTS_DIR)
    await generateUpdateFiles('linux', VERSION, ARTIFACTS_DIR)

    console.log('\n✅ Génération terminée')
}

main().catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
})
