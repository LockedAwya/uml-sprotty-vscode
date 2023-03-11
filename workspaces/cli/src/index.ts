/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import { Command } from 'commander';
//import { UmlDiagramLanguageMetaData } from '../uml-langium/language-server/generated/module';
import { UmlDiagramLanguageMetaData } from '../../uml-langium/language-server/src/generated/module';
import { generateAction } from './generator';

const program = new Command();

//program
// eslint-disable-next-line @typescript-eslint/no-var-requires
//.version(require('../../package.json').version);

program
    .command('generate')
    .argument('<file>', `possible file extensions: ${UmlDiagramLanguageMetaData.fileExtensions.join(', ')}`)
    .option('-d, --destination <dir>', 'destination directory of generating')
    .option('-r, --root <dir>', 'source root folder')
    .option('-q, --quiet', 'whether the program should print something', false)
    .description('generates Java classes by Class description')
    .action(generateAction);

program.parse(process.argv);
