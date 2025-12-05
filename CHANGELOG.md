# ecoindex-app

## 0.1.13

### Patch Changes

- f081ddd: Correction de la syntaxe des variables d'environnement conditionnelles dans GitHub Actions

## 0.1.12

### Patch Changes

- 8921895: Correction des builds Windows et macOS Intel : conditionnement des variables d'environnement macOS et amélioration de la vérification de signature

## 0.1.11

### Patch Changes

- bc5e4ff: Correction des builds Linux et Windows en conditionnant les commandes macOS

## 0.1.10

### Patch Changes

- bcf95b8: Correction de la détection de la configuration de signature et amélioration des logs de debug

## 0.1.9

### Patch Changes

- fe63d57: Amélioration de la vérification du certificat et ajout de logs pour diagnostiquer le problème de signature

## 0.1.8

### Patch Changes

- 009f3ad: Ajout de logs de debug pour diagnostiquer pourquoi la signature n'est pas appliquée

## 0.1.7

### Patch Changes

- 2012e56: Correction du chemin de recherche de l'application pour la vérification de signature

## 0.1.6

### Patch Changes

- 0a16cb7: Ajout du fichier CONTRIBUTING.md avec toutes les informations de développement et simplification du README pour l'utilisation
- beaecfb: Correction de l'extraction ZIP dans create-dmg.js pour préserver la signature et ajout de vérifications de signature dans le workflow

## 0.1.5

### Patch Changes

- ccaca4e: Correction du script create-dmg.js pour préserver la signature macOS lors de la copie
- 529de72: Réorganisation de l'ordre des imports dans create-dmg.js

## 0.1.4

### Patch Changes

- 7fe4e2a: Ajout d'instructions détaillées pour obtenir et encoder le certificat macOS
- 9f9bff1: Ajout de documentation pour ouvrir les applications non signées sur macOS
- f660ba3: Exiger la signature macOS dans le workflow GitHub Actions

## 0.1.3

### Patch Changes

- 25cc9fc: Correction du workflow changeset pour éviter qu'il s'exécute sur les commits de version

## 0.1.2

### Patch Changes

- e692fa1: Correction du workflow release pour qu'il ne se déclenche qu'après le merge de la PR de version créée par changeset

## 0.1.1

### Patch Changes

- 598956b: Correction d'une faute de frappe dans la description du README
- 7147b53: Test du processus complet de changeset et release
- b835027: Test du workflow changeset et release
