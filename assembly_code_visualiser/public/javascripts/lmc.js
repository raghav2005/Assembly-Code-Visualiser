// define classes

// AQA A level instruction template
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

// LMC template w/ methods used later
class Little_Man_Computer {

	constructor(args) {

		this.outputs = [];
		this.inputs = args.inputs || [];

		this.RAM = args.RAM || [];
		this.RAM_value_length = args.RAM_value_length || 2; // same as general_registers_value_length

		this.general_registers = args.general_registers || [];

		this.accumulator = 0;
		this.program_counter = 0;

		this.instruction_set = args.instruction_set || {};

	};

	// ensure backend RAM values are 2 digits long
	RAM_backend_to_RAM_value_length_digits(location) {
		
		// ensure 2 digits long
		if (this.RAM[location].length < this.RAM_value_length) {
		
			this.RAM[location] = '0' + this.RAM[location];
		
		} else if (this.RAM[location].length > this.RAM_value_length) {

			var location_as_string = location.toString();

			while (location_as_string.length < this.RAM_value_length) {
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

	// ensure backend general registers' values are 2 digits long
	general_registers_backend_to_RAM_value_length_digits(location) {

		if (this.general_registers[location].length < this.RAM_value_length) {

			this.general_registers[location] = '0' + this.general_registers[location];

		} else if (this.general_registers[location].length > this.RAM_value_length) {

			var location_as_string = location.toString();

			while (location_as_string.length < this.RAM_value_length) {
				location_as_string = '0' + location_as_string;
			}

			alert('General Purpose Register ' + location_as_string + '\'s value must be ' + this.RAM_value_length.toString() + ' or less digits long');

			this.reset_specific_general_register(location);

		} else {
			// do nothing - correct length
		};

	};

	// populate frontend visualisation general purpose registers with the values stored in this.general_registers
	load_general_registers_from_backend() {
		for (var i = 0; i < this.general_registers.length; i++) {
			// will always be 2 digits long because backend is always 2 digits long
			document.getElementById("general_register_" + i.toString()).value = this.general_registers[i];
		};
	};

	// reset all values in the general registers in backend (automatically update to frontend because read-only)
	reset_general_registers() {
		for (var i = 0; i < this.general_registers.length; i++) {
			this.general_registers[i] = '0'.repeat(this.RAM_value_length);
		};
		this.load_general_registers_from_backend();
	};

	// reset the value of a specific general register in frontend + backend to 00
	reset_specific_general_register(location) {
		this.general_registers[location] = '0'.repeat(this.RAM_value_length);
		document.getElementById("general_register_" + location.toString()).value = this.general_registers[location];
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


// functions to initialize values

// create instruction and LMC objects
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

	general_registers = [];

	for (var i = 0; i < 10; i++) {
		general_registers.push('0'.repeat(RAM_value_length));
	}

	var LMC = new Little_Man_Computer({
		instruction_set: instruction_set,
		RAM: RAM,
		RAM_value_length: RAM_value_length,
		general_registers: general_registers
	});

	return LMC
}

// create leader-lines for address, control, & data buses
function create_buses() {

	address_bus = new LeaderLine(
		document.getElementById('MAR_wrapper'),
		LeaderLine.pointAnchor(document.getElementById('memory_10_wrapper'), {
			x: 0,
			y: '25%'
		}),
		{
			color: '#AAAAAA',
			size: 8,
			// outline: true,
			// endPlugOutline: true,
			// outlineColor: '#AAAAAA',
			// endPlugSize: 0.75,
			middleLabel: LeaderLine.pathLabel({
				text: 'Address Bus',
				color: 'black'
			}),
			path: 'straight',
			startSocket: 'right',
			endSocket: 'left',
			endPlug: 'arrow3'
		}
	);

	control_bus = new LeaderLine(
		document.getElementById('control_unit_wrapper'),
		LeaderLine.pointAnchor(document.getElementById('memory_50_wrapper'), {
			x: 0,
			y: '36%'
		}),
		{
			color: '#AAAAAA',
			size: 8,
			// outline: true,
			// endPlugOutline: true,
			// outlineColor: '#AAAAAA',
			// endPlugSize: 0.75,
			middleLabel: LeaderLine.pathLabel({
				text: 'Control Bus',
				color: 'black'
			}),
			path: 'straight',
			startSocket: 'right',
			endSocket: 'left',
			startPlug: 'arrow3',
			endPlug: 'arrow3'
		}
	);

	data_bus = new LeaderLine(
		document.getElementById('MBR_wrapper'),
		LeaderLine.pointAnchor(document.getElementById('memory_80_wrapper'), {
			x: 0,
			y: '87.5%'
		}),
		{
			color: '#AAAAAA',
			size: 8,
			// outline: true,
			// endPlugOutline: true,
			// outlineColor: '#AAAAAA',
			// endPlugSize: 0.75,
			middleLabel: LeaderLine.pathLabel({
				text: 'Data Bus',
				color: 'black'
			}),
			path: 'straight',
			startSocket: 'right',
			endSocket: 'left',
			startPlug: 'arrow3',
			endPlug: 'arrow3',
		}
	);

};


LMC = initialise_LMC();


// all window event listeners from HTML
window.addEventListener('load', create_buses);

// run everytime anything on the page is clicked
window.addEventListener('click', function() {
	
	LMC.load_RAM_from_frontend();
	LMC.load_general_registers_from_backend();

	// // BELOW WORKS
	// control_bus.setOptions({
	// 	end: document.getElementById('memory_98_wrapper'),
	// 	path: 'fluid'
	// });
});


// functions called from HTML buttons

// remove all text froma assembly code editor
function clear_editor() {
	document.getElementById('code_area').value = '';
};

// set all values in RAM back to 00
function reset_RAM(LMC) {
	LMC.reset_RAM();
};

// open new tab with /instruction_set 
function open_link_new_tab(location) {
	
	// ternary operator used in case window.location doesn't include '/', works as follows:
	// bool_expr ? result_if_bool_expr_true : result_if_bool_expr_false;
	var redirect_to = window.location.toString() + (window.location.toString().includes('/') ? location : ('/' + location));

	window.open(redirect_to, '_blank');
};
