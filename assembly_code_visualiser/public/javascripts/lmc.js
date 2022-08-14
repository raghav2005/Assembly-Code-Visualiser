class Instruction {

	constructor(args) {

		this.name = args.name;
		this.numerical_value = args.numerical_value;

		this.operands = args.operands; // list of 'R's, 'M's, 'B's and/or 'L', where R = Register, M = Memory, B = Both/Either, L = Label (for Branch)

	};

	no_of_operands() {
		return this.operands.length;
	};

	get_operand_type(operand_num) {
		return this.operands[operand_num - 1];
	}; // e.g. for LDR instruction, operand_num = 1 would return R because the first operand is Rd

};

class Little_Man_Computer {

	constructor(args) {

		this.outputs = [];
		this.inputs = args.inputs || [];

		this.RAM = args.RAM || [];
		this.RAM_value_length = args.RAM_value_length || 3;

		this.accumulator = 0;
		this.program_counter = 0;

		this.instruction_set = args.instruction_set || {};

	};

	// ensure backend RAM values are 2 digits long
	RAM_backend_to_RAM_value_length_digits(location) {
		
		if (this.RAM[location].length < this.RAM_value_length) {
		
			this.RAM[location] = '0' + this.RAM[location];
		
		} else if (this.RAM[location].length > this.RAM_value_length) {

			var location_as_string = location.toString();

			while (location_as_string.length < 2) {
				location_as_string = '0' + location_as_string;
			}

			alert('RAM value at memory location ' + location_as_string + ' must be ' + this.RAM_value_length.toString() + ' or less digits long');

			this.reset_specific_RAM(location);
		
		} else {
			// do nothing - correct length
		};

	};

	// populate frontend visualisation RAM locations with the values stored in this.RAM
	load_RAM_from_backend() {
		for (var i = 0; i < this.RAM.length; i++) {
			// will always be 2 digits long because backend is always 2 digits long
			document.getElementById("memory_location_" + i.toString()).value = this.RAM[i];
		};
	};

	// populate this.RAM with the values in the frontent visualisation RAM locations
	load_RAM_from_frontend() {
		
		for (var i = 0; i < this.RAM.length; i++) {
			this.RAM[i] = document.getElementById("memory_location_" + i.toString()).value;
			this.RAM_backend_to_RAM_value_length_digits(i);
		};

		this.load_RAM_from_backend();
	
	};

	// reset all values in RAM location in frontend + backend to 00
	reset_RAM() {
		for (var i = 0; i < this.RAM.length; i++) {
			this.RAM[i] = '0'.repeat(this.RAM_value_length);
		};
		this.load_RAM_from_backend();
	};

	// reset the value at a specific RAM location in frontend + backend to 00
	reset_specific_RAM(location) {
		this.RAM[location] = '0'.repeat(this.RAM_value_length);
		document.getElementById("memory_location_" + location.toString()).value = this.RAM[location];
	};

	get_addressing_mode(operand) {
		if (operand[0] === '#') {
			return 'direct'
		} else if (operand[0] === 'R') {
			return 'immediate'
		} else {
			return 'error'
		};
	};

};

function initialise_LMC() {

	var HALT = new Instruction({
		name: 'HALT',
		numerical_value: 0,
		operands: []
	});
	var LDR = new Instruction({
		name: 'LDR',
		numerical_value: 10,
		operands: ['R', 'M']
	});
	var STR = new Instruction({
		name: 'STR',
		numerical_value: 11,
		operands: ['R', 'M']
	});
	var MOV = new Instruction({
		name: 'MOV',
		numerical_value: 12,
		operands: ['R', 'B']
	});
	var ADD = new Instruction({
		name: 'ADD',
		numerical_value: 20,
		operands: ['R', 'R', 'B']
	});
	var SUB = new Instruction({
		name: 'SUB',
		numerical_value: 21,
		operands: ['R', 'R', 'B']
	});
	var B = new Instruction({
		name: 'B',
		numerical_value: 30,
		operands: ['L']
	});
	var BEQ = new Instruction({
		name: 'BEQ',
		numerical_value: 31,
		operands: ['L']
	});
	var BNE = new Instruction({
		name: 'BNE',
		numerical_value: 32,
		operands: ['L']
	});
	var BGT = new Instruction({
		name: 'BGT',
		numerical_value: 33,
		operands: ['L']
	});
	var BLT = new Instruction({
		name: 'BLT',
		numerical_value: 34,
		operands: ['L']
	});
	var CMP = new Instruction({
		name: 'CMP',
		numerical_value: 35,
		operands: ['R', 'B']
	});
	var AND = new Instruction({
		name: 'AND',
		numerical_value: 40,
		operands: ['R', 'R', 'B']
	});
	var ORR = new Instruction({
		name: 'ORR',
		numerical_value: 41,
		operands: ['R', 'R', 'B']
	});
	var EOR = new Instruction({
		name: 'EOR',
		numerical_value: 42,
		operands: ['R', 'R', 'B']
	});
	var MVN = new Instruction({
		name: 'MVN',
		numerical_value: 43,
		operands: ['R', 'B']
	});
	var LSL = new Instruction({
		name: 'LSL',
		numerical_value: 44,
		operands: ['R', 'R', 'B']
	});
	var LSR = new Instruction({
		name: 'LSR',
		numerical_value: 45,
		operands: ['R', 'R', 'B']
	});

	var instruction_set = {
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

	RAM = [];
	var RAM_value_length = 2;

	for (var i = 0; i < 100; i++) {
		RAM.push('0'.repeat(RAM_value_length));
	};

	var LMC = new Little_Man_Computer({
		instruction_set: instruction_set,
		RAM: RAM,
		RAM_value_length: RAM_value_length
	});

	return LMC
}

// $('#test_btn').on('click', function() {
// 	test_onclick(LMC);
// });


LMC = initialise_LMC();

function test_onclick(LMC) {
	LMC.load_RAM_from_frontend();
	alert(LMC.RAM);
	// $('#test_p').append(LMC.RAM.toString() + '<br />');
};
