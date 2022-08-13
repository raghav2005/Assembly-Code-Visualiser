var Little_Man_Computer = require('./lmc_creator');
var Instruction = require('./lmc_instruction_creator');

// const instruction_set = {
// 	'LDR': ,
// 	'STR': ,
// 	'ADD': ,
// 	'SUB': ,
// 	'MOV': ,
// 	'CMP': ,
// 	'B': ,
// 	'BEQ': ,
// 	'BNE': ,
// 	'BGT': ,
// 	'BLT': ,
// 	'AND': ,
// 	'ORR': ,
// 	'EOR': ,
// 	'MVN': ,
// 	'LSL': ,
// 	'LSR': ,
// 	'HALT': 
// };

let LDR = new Instruction({
	name: 'LDR',
	numerical_value: 100,
	operands: ['R', 'M']
});

console.log(LDR.no_of_operands());
console.log(LDR.get_operand_type(1));

let STR = new Instruction({
	name: 'STR',
	numerical_value: 200,
	operands: ['R', 'M']
});

let ADD = new Instruction({
	name: 'ADD',
	numerical_value: 300,
	operands: ['R', 'R', 'R']
});

// var LMC = new Little_Man_Computer({
// 	instruction_set: instruction_set
// });
