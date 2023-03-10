grammar UmlDiagram

entry Umlmodel:
    'model' name=ID
    //(elements+=AbstractElement)*;
    (classes+=Class | datatypes+=DataType | types+=Type)*;

// AbstractElement:
//     (classes+=Class | datatypes+=DataType | types+=Type)*;

Type:
    DataType | Class;

DataType:
    'datatype' name=ID;

// Class:
//     'class' name=ID (inheritance=Inheritance)? '{'
//         (features+=Feature)*
//     '}';

Class:
    'class' name=ID (inheritance+=Inheritance)? '{'
        (features+=Feature)*
    '}';

Inheritance:
    'extends' class=[Class];

Feature:
    (many?='many')? name=ID ':' type=[Type:QualifiedName];

QualifiedName returns string:
    ID ('.' ID)*;


hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;