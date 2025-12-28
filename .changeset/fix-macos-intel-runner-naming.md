---
"ecoindex-app": patch
---

## Correction du runner macOS Intel

- **Changement du runner macOS Intel** : Utilisation de `macos-15-intel` au lieu de `macos-15` pour le build macOS Intel. Cela résout le problème de fichiers en double lors de la création de la release GitHub, car les fichiers générés par les builds Intel et ARM avaient des noms similaires et étaient confondus lors de la déduplication.

**Référence** : [GitHub Actions Runner Images - macOS 15](https://github.com/actions/runner-images/blob/macos-15-arm64/20251215.0075/images/macos/macos-15-Readme.md)

