var Little_Man_Computer = require('./lmc_creator');
var Instruction = require('./lmc_instruction_creator');

let HALT = new Instruction({
	name: 'HALT',
	numerical_value: 0,
	operands: []
});
let LDR = new Instruction({
	name: 'LDR',
	numerical_value: 10,
	operands: ['R', 'M']
});
let STR = new Instruction({
	name: 'STR',
	numerical_value: 11,
	operands: ['R', 'M']
});
let MOV = new Instruction({
	name: 'MOV',
	numerical_value: 12,
	operands: ['R', 'B']
});
let ADD = new Instruction({
	name: 'ADD',
	numerical_value: 20,
	operands: ['R', 'R', 'B']
});
let SUB = new Instruction({
	name: 'SUB',
	numerical_value: 21,
	operands: ['R', 'R', 'B']
});
let B = new Instruction({
	name: 'B',
	numerical_value: 30,
	operands: ['L']
});
let BEQ = new Instruction({
	name: 'BEQ',
	numerical_value: 31,
	operands: ['L']
});
let BNE = new Instruction({
	name: 'BNE',
	numerical_value: 32,
	operands: ['L']
});
let BGT = new Instruction({
	name: 'BGT',
	numerical_value: 33,
	operands: ['L']
});
let BLT = new Instruction({
	name: 'BLT',
	numerical_value: 34,
	operands: ['L']
});
let CMP = new Instruction({
	name: 'CMP',
	numerical_value: 35,
	operands: ['R', 'B']
});
let AND = new Instruction({
	name: 'AND',
	numerical_value: 40,
	operands: ['R', 'R', 'B']
});
let ORR = new Instruction({
	name: 'ORR',
	numerical_value: 41,
	operands: ['R', 'R', 'B']
});
let EOR = new Instruction({
	name: 'EOR',
	numerical_value: 42,
	operands: ['R', 'R', 'B']
});
let MVN = new Instruction({
	name: 'MVN',
	numerical_value: 43,
	operands: ['R', 'B']
});
let LSL = new Instruction({
	name: 'LSL',
	numerical_value: 44,
	operands: ['R', 'R', 'B']
});
let LSR = new Instruction({
	name: 'LSR',
	numerical_value: 45,
	operands: ['R', 'R', 'B']
});

const instruction_set = {
	'LDR': LDR,
	'STR': STR,
	'ADD': ADD,
	'SUB': SUB,
	'MOV': MOV,
	'CMP': CMP,
	'B': B,
	'BEQ': BEQ,
	'BNE': BNE,
	'BGT': BGT,
	'BLT': BLT,
	'AND': AND,
	'ORR': ORR,
	'EOR': EOR,
	'MVN': MVN,
	'LSL': LSL,
	'LSR': LSR,
	'HALT': HALT
};

console.log(HALT.no_of_operands());
console.log(HALT.get_operand_type(1));
console.log(LDR.no_of_operands());
console.log(LDR.get_operand_type(1));

RAM = [];
for (var i = 0; i < 100; i++) {
	RAM.push(1);
};

var LMC = new Little_Man_Computer({
	instruction_set: instruction_set,
	RAM: RAM
});
