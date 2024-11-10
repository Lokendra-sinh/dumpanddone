

module.exports = {

    parser: "@typescript-eslint/parser", 
    plugins: [
      "@typescript-eslint",
      "import",                      
    ],
    extends: [
      "./base.cjs",
      "eslint:recommended",                
      "plugin:@typescript-eslint/recommended",
      "plugin:import/errors",
      "plugin:import/typescript",         
    ],
    env: {
      browser: true,      
      es2022: true,    
    },
}