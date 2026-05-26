# Dépannage CSS - Tailwind

Si les styles ne s'affichent pas, voici les étapes à suivre :

## 1. Vérifier l'installation

```bash
cd client
npm install
```

## 2. Redémarrer le serveur de développement

**Important** : Après avoir installé ou modifié Tailwind, il faut redémarrer le serveur :

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer :
npm run dev
```

## 3. Vérifier les fichiers de configuration

### `postcss.config.js` doit exister et contenir :
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### `tailwind.config.js` doit contenir :
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### `src/index.css` doit commencer par :
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### `src/main.tsx` doit importer le CSS :
```tsx
import './index.css'
```

## 4. Vérifier dans le navigateur

Ouvrez les outils de développement (F12) et vérifiez :
- Que le fichier CSS est bien chargé dans l'onglet "Network"
- Que les classes Tailwind sont présentes dans l'onglet "Elements"

## 5. Test rapide

Ajoutez temporairement cette classe dans un composant pour tester :
```tsx
<div className="bg-red-500 text-white p-4">
  Test Tailwind
</div>
```

Si le fond est rouge, Tailwind fonctionne !

## 6. Si ça ne fonctionne toujours pas

1. Supprimez `node_modules` et `package-lock.json`
2. Réinstallez : `npm install`
3. Redémarrez le serveur : `npm run dev`
