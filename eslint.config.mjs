import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // هذه القواعد صارمة جداً وتمنع أنماط React الاعتيادية الصحيحة
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      // تحذيرات img لا تمنع البناء
      "@next/next/no-img-element": "warn",
      // الأحرف غير المشفرة — تحذير فقط
      "react/no-unescaped-entities": "warn",
    },
  },
]);

export default eslintConfig;
