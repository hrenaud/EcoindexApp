---
"ecoindex-app": patch
---

## Optimisation CI/CD

- **Optimisation du workflow de build** : Ajout de la variable d'environnement `PUPPETEER_SKIP_DOWNLOAD: true` dans le step "Install dependencies" du workflow GitHub Actions pour éviter le téléchargement inutile de Puppeteer pendant les builds CI/CD. Cela accélère significativement le processus de build sur toutes les plateformes (Linux, Windows, macOS).

