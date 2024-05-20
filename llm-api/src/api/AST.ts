import * as fs from 'fs';
import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';

// Function to parse a file and print the AST
export const ASTfile = (sourceCode: string): any[] => {
  const ast = babelParser.parse(sourceCode, {
    sourceType: 'module',
    plugins: [
        'jsx', // Enable parsing JSX syntax
        'typescript', // Enable parsing TypeScript syntax
        'asyncGenerators', // Enable parsing async generator functions
        'bigInt', // Enable parsing BigInt literals
        'classProperties', // Enable parsing class properties
        'decorators-legacy', // Enable parsing legacy decorators
        'doExpressions', // Enable parsing do expressions
        'dynamicImport', // Enable parsing dynamic import syntax
        'exportDefaultFrom', // Enable parsing export default from syntax
        'exportNamespaceFrom', // Enable parsing export * as namespace from syntax
        'functionBind', // Enable parsing function bind syntax
        'functionSent', // Enable parsing function.sent meta property syntax
        'importMeta', // Enable parsing import.meta syntax
        'logicalAssignment', // Enable parsing logical assignment operators
        'nullishCoalescingOperator', // Enable parsing nullish coalescing operator
        'numericSeparator', // Enable parsing numeric separator syntax
        'optionalCatchBinding', // Enable parsing optional catch binding syntax
        'optionalChaining', // Enable parsing optional chaining syntax
        'throwExpressions', // Enable parsing throw expressions
        'topLevelAwait', // Enable parsing top level await syntax
        'typescript', // Enable parsing TypeScript syntax
    ],
  });
  
  return(JSON.parse(JSON.stringify(ast)).program.body)

}