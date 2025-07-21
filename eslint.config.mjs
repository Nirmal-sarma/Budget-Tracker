import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "@typescript-eslint/eslint-plugin"; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  
  {
    ignores: [
      "lib/generated/**",    
      ".next/**",            
      "node_modules/**"
    ],
  },

  
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  


  {
    plugins: {
      "@typescript-eslint": tseslint,   
    },
    rules: {
      
      "@typescript-eslint/no-explicit-any": "off",

      
      "@typescript-eslint/no-require-imports": "off",

      
      "@typescript-eslint/no-unused-vars": "warn",

      
      "@typescript-eslint/no-empty-object-type": "off",

    },
  },
];
