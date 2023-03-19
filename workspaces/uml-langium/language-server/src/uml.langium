grammar UmlDiagram

entry Umlmodel:
    'model' name=ID
    //(elements+=AbstractElement)*;
    (interfaces+=Interface | classes+=Class | datatypes+=DataType | types+=Type)*;

// AbstractElement:
//     (classes+=Class | datatypes+=DataType | types+=Type)*;

Type:
    DataType | Class | Interface;

DataType:
    'datatype' name=ID;

// Class:
//     'class' name=ID (inheritance=Inheritance)? '{'
//         (features+=Feature)*
//     '}';

Class:
    (abstract?='abstract')? 'class' name=ID (inheritance+=Inheritance)? (Implementation+=Implementation)? '{'
        (features+=Feature)*
    '}';

Interface:
    'interface' name=ID (interfaceInheritance+=InterfaceInheritance)? '{'
        (features+=Feature)*
    '}';

//a class can implement any number of other interfaces
Implementation:
    'implements' (interface+=[Interface])+;

//a feature can contain any number of other params
// ContainsParams:
//     '(' (param+=Param)* ')';

Param:
    //'('name=ID ':' type=[Type:QualifiedName]')';
    (many?='many')? name=ID ':' type=[Type:QualifiedName];

//a class can extend only one another class
Inheritance:
    'extends' class=[Class];

//an interface can extend any number of other interfaces
InterfaceInheritance:
    'extends' (interface+=[Interface])+;

Feature:
    (many?='many')? name=ID (param?='(' (params+=Param)* ')')?':' type=[Type:QualifiedName];

// Feature:
//     (many?='many')? name=ID ':' type=[Type:QualifiedName];

QualifiedName returns string:
    ID ('.' ID)*;


hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;