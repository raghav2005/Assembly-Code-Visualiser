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
		this.RAM_value_length = args.RAM_value_length || 3; // same as general_registers_value_length

		this.general_registers = args.general_registers || [];
		this.program_counter = 0;

		this.instruction_set = args.instruction_set || {};

		this.clock = 50;
		this.time_lapse = 10000;
		this.paused = true;

		this.labels = {};
		this.errors = [];
		this.inp;
		this.carry_on;
		this.cycles = 0;

		this.stop = false;

	};

	// ensure backend RAM values are 2 digits long
	RAM_backend_to_RAM_value_length_digits(location) {

		// ensure 4 digits long
		if (this.RAM[location].length < this.RAM_value_length) {

			while (this.RAM[location].length < this.RAM_value_length) {
				this.RAM[location] = '0' + this.RAM[location];
			}

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
			// this.RAM_backend_to_RAM_value_length_digits(i);
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

			while (this.general_registers[location].length < this.RAM_value_length) {
				this.general_registers[location] = '0' + this.general_registers[location];
			}

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

	reset_all_registers() {
		this.reset_general_registers();
		document.getElementById('MAR').value = '00';
		document.getElementById('accumulator').value = '00';
		document.getElementById('status_register').value = '00';
		document.getElementById('CIR').value = '00';
		document.getElementById('PC').value = '00';
		document.getElementById('MBR').value = '0'.repeat(this.RAM_value_length);
		this.program_counter = 0;
	};

	reset_verbose_output() {
		document.getElementById('verbose_output').value = '';
	};

	reset_all_inp_out() {
		document.getElementById('input').value = '';
		document.getElementById('output').value = '';
		document.getElementById('FDE_output').value = '';
		this.reset_verbose_output();
	};

	// get operand and see if memory location required, or if register required
	// get_addressing_mode(operand) {
	// 	if (operand[0] === '#') {
	// 		return 'direct'
	// 	} else if (operand[0] === 'R') {
	// 		return 'immediate'
	// 	} else {
	// 		return 'error'
	// 	};
	// };

	// change border color of element to blue if blue
	activate_deactivate_wrapper(element) {

		var element_info = document.getElementById(element);

		if ($(element_info).css('border-color') !== 'rgb(64, 64, 255)') {
			$(element_info).css('border-color', '#4040FF');
		} else {
			$(element_info).css('border-color', '#AAAAAA');
		};
	};

	// log to FDE Cycle Output (based on reset), and to Verbose Output
	log_output(text, reset = false) {

		if (reset) {
			document.getElementById('FDE_output').value = text.replace('   ', '&nbsp;&nbsp;&nbsp;') + '\r\n';
		} else {
			document.getElementById('FDE_output').value = document.getElementById('FDE_output').value + text.replace('   ', '&nbsp;&nbsp;&nbsp;') + '\r\n';
		}

		document.getElementById('verbose_output').value = document.getElementById('verbose_output').value + text.replace('   ', '&nbsp;&nbsp;&nbsp;') + '\r\n';
		document.getElementById('verbose_output').scrollTop = document.getElementById('verbose_output').scrollHeight;

	};

	scan_code() {

		this.labels = {};
		var counter = 0;
		var assembly_code = document.getElementById('code_area').value.toUpperCase();
		var lines = assembly_code.split('\n');

		for (var i = 0; i < lines.length; i++) {

			var line = lines[i].trim();

			if (line != '') {
				
				var instruction = line.split(/\s+/);

				if (instruction.length == 2) {
					
					if (instruction[1] == 'DAT') {
						this.labels[instruction[0]] = counter;
						this.reset_specific_RAM(counter);
					} else if (!(instruction[0] in this.instruction_set)) {
						this.labels[instruction[0]] = counter;
					};

				};

				if (instruction.length == 3) {

					if (instruction[1] == 'DAT') {
						this.labels[instruction[0]] = counter;
						this.RAM[counter] = instruction[2].toString();
					} else if (!(instruction[0] in this.instruction_set)) {
						this.labels[instruction[0]] = counter;
					}

				};

				counter++;

			};
		};
	};

	load() {

		// clearInterval(this.carry_on);
		this.load_RAM_from_frontend();

		this.paused = true;
		// this.activate_deactivate_wrapper('step_program');
		this.cycles = 0;

		// reset all registers (general purpose and special purpose)
		this.reset_all_registers();
		// reset all inputs / outputs / displays
		this.reset_all_inp_out();
		// reset RAM
		this.reset_RAM();
		// reset general registers
		this.reset_general_registers();

		// scan code for labels
		this.scan_code();

		// load program in RAM
		var counter = 0;
		var assembly_code = document.getElementById('code_area').value.toUpperCase();
		var lines = assembly_code.split('\n');

		for (var i = 0; i < lines.length; i++) {

			var line = lines[i].trim();

			if (line != '') {

				var instruction = line.split(/\s+/);

				if (instruction.length == 3) {
					
					var label = instruction[0];
					var opcode = instruction[1];
					var operand = instruction[2];

					this.labels[label] = counter;

					if (operand in this.labels) {
						operand = this.labels[operand];
					};

					if (operand.length > 1) {

						if (operand.substring(0, 1) == '@') {
						
							operand = operand.substring(1);
						
							if (isNaN(operand)) {
								if (operand in this.labels) {
									operand = '@' + this.labels[operand];
								};
							} else {
								operand = '@' + operand;
							};

						} else if (operand.substring(0, 1) == '#') {

							operand = operand.substring(1);

							if (isNaN(operand)) {
								if (operand in this.labels) {
									operand = '#' + this.labels[operand];
								};
							} else {
								operand = '#' + operand;
							};

						};

					};

					if (opcode in this.instruction_set) {

						var encode = this.instruction_set[opcode].numerical_value + operand;
						this.RAM[counter] = encode.toString();

						counter++;

					} else if (opcode == 'DAT') {
					
						counter++;
					
					} else {

						this.log_output('Error at line ' + counter + ': Invalid opcode');

					};

				} else if (instruction.length == 2) {

					if (instruction[0] in this.instruction_set) {
						
						var opcode = instruction[0];
						var operand = instruction[1];

						if (operand in this.labels) {
							operand = this.labels[operand];
						};
						
						//Indirect Addressing
						if (operand.length > 1) {

							if (operand.substring(0, 1) == '@') {
								
								operand = operand.substring(1);
								
								if (isNaN(operand)) {
									if (operand in this.labels) {
										operand = '@' + this.labels[operand];
									};
								} else {
									operand = '@' + operand;
								};

							} else if (operand.substring(0, 1) == '#') {
								
								operand = operand.substring(1);
								
								if (isNaN(operand)) {
									if (operand in this.labels) {
										operand = '#' + this.labels[operand];
									};
								} else {
									operand = '#' + operand;
								};
							
							};
						
						};

						var encode = this.instruction_set[opcode].numerical_value + operand;
						this.RAM[counter] = encode.toString();

						counter++;
					
					} else {

						this.labels[instruction[0]] = counter;
						var opcode = instruction[1];

						if (opcode in this.instruction_set) {

							var encode = this.instruction_set[opcode].numerical_value;
							this.RAM[counter] = encode.toString();

							counter++;

						} else if (instruction[1] == 'DAT') {

							counter++;

						} else {

							this.log_output('Error at line ' + counter + ': Invalid instruction');

						};

					};

				} else {

					if (line in this.instruction_set) {
						this.RAM[counter] = this.instruction_set[line].numerical_value;
						counter++;
					} else {
						this.log_output('Error at line ' + counter + ': Invalid instruction');
					};

				};

			};

			this.load_RAM_from_backend();

		};

		for (var i = 0; i < this.RAM.length; i++) {
			if (this.RAM[i] == '') {
				this.reset_specific_RAM(i);
			};
		};
		this.load_RAM_from_backend();
	};

	process_instruction() {

		this.program_counter = parseInt(document.getElementById('PC').value);
		// this.activate_deactivate_wrapper('PC_wrapper');

		// fetch instruction

		this.log_output('####################', true);
		this.log_output('Fetching instruction...');

		var instruction = document.getElementById('memory_location_' + this.program_counter).value;
		// if (instruction != '0'.repeat(this.RAM_value_length) || instruction != '00') { // remove all leading 0s
		// 	instruction = instruction.replace(/^0+/, '');
		// 	if (instruction == '') {
		// 		instruction = '0';
		// 	};
		// };

		this.log_output('Set MAR to value of PC: ' + this.program_counter);
		document.getElementById('MAR').value = this.program_counter;
		
		this.log_output('Increment PC by 1');
		this.program_counter++;
		document.getElementById('PC').value = this.program_counter;

		this.log_output('Fetch instruction from address stored in MAR');;
		this.log_output('Fetched instruction ' + instruction + ' stored in MBR');
		this.log_output('Copy instruction from MBR to CIR');

		document.getElementById('MBR').value = instruction;
		document.getElementById('CIR').value = instruction;

		this.log_output('Decoding instruction stored in CIR...');

		// halt instruction
		if (instruction == '000') {

			this.log_output('HLT');
			this.log_output('Executing instruction...');
			this.log_output('Program stopped');

			this.cycles++;

			this.log_output('####################');
			this.log_output('Program executed in ' + this.cycles + ' FDE cycles');

			this.cycles = 0;
			this.paused = true;

			this.stop = true;

			// document.getElementById('pausebtn').innerHTML = '<i class="fa fa-play"></i>';

			// clearInterval(this.carry_on);

		} else if (instruction == '901') { // input instruction

			this.log_output('INP');
			this.log_output('Executing instruction...');
			this.log_output('Waiting for user input...');
			this.cycles++;

			// ! MAKE THIS WORK SO CAN'T DO ANYTHING UNTIL SOMETHING INPUTTED INTO INPUT BOX IN CONTROLBOX

			

			this.inp = prompt('User input:');
			document.getElementById('input').value = this.inp;
			// document.getElementById('input').value = document.getElementById('input').value + this.inp + '\n';
			document.getElementById('input').scrollTop = document.getElementById('input').scrollHeight;

			this.log_output('Store user input in Accumulator: ' + this.inp);
			document.getElementById('accumulator').value = this.inp;

		} else if (instruction == '902') { // output instruction

			this.log_output('OUT');
			this.log_output('Executing instruction...');
			this.log_output('Output value held in Accumulator: ' + document.getElementById('accumulator').value);

			this.cycles++;

			// document.getElementById('output').value = document.getElementById('output').value + document.getElementById('accumulator').value + '\n';
			document.getElementById('output').value = document.getElementById('accumulator').value;
			document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;

		} else {

			var opcode = instruction.substr(0, 1);
			var operand_address = instruction.substr(1);
			var operand;
			var direct = false;

			if (operand_address.substr(0, 1) == '@') { // indirect addressing
				operand = parseInt(document.getElementById('memory_location_' + operand_address.substr(1)).value);
			} else if (operand_address.substr(0, 1) == '#') { // direct addressing
				direct = true;
				operand = operand_address.substr(1);
			} else {
				operand = operand_address;
			};

			var accumulator = parseInt(document.getElementById('accumulator').value);

			if (opcode == '1') { // add instruction

				this.log_output('ADD');
				this.log_output('Executing instruction...');

				this.cycles++;

				var MBR;

				if (direct) {
					MBR = parseInt(operand);
					this.log_output('Direct addressing: set MBR to operand of current instruction: ' + operand);
					document.getElementById('MBR').value = MBR;
				} else {
					MBR = parseInt(document.getElementById('memory_location_' + operand).value);
					this.log_output('Set MAR to operand of the current instruction: ' + operand);
					this.log_output('Fetch data at location held by MAR and store it in MBR: ' + MBR);
					document.getElementById('MAR').value = operand;
					document.getElementById('MBR').value = MBR;
				};

				this.log_output('Add MBR value to Accumulator and store the result in Accumulator: ' + accumulator + '+' + MBR + '=' + (accumulator + MBR));
				accumulator += MBR;
				document.getElementById('accumulator').value = accumulator;

			} else if (opcode == '2') { // subtract instruction

				this.log_output('SUB');
				this.log_output('Executing instruction...');

				this.cycles++;

				var MBR;

				if (direct) {
					MBR = parseInt(operand);
					this.log_output('Direct addressing: set MBR to operand of current instruction: ' + operand);
					document.getElementById('MBR').value = MBR;
				} else {
					MBR = parseInt(document.getElementById('memory_location_' + operand).value);
					this.log_output('Set MAR to operand of the current instruction: ' + operand);
					this.log_output('Fetch data at location held by MAR and store it in MBR: ' + MBR);
					document.getElementById('MAR').value = operand;
					document.getElementById('MBR').value = MBR;
				};

				this.log_output('Subtract MBR value from Accumulator and store the result in Accumulator: ' + accumulator + '-' + MBR + '=' + (accumulator - MBR));
				accumulator -= MBR;
				document.getElementById('accumulator').value = accumulator;

			} else if (opcode == '5') { // load to accumulator

				this.log_output('LDA');
				this.log_output('Executing instruction...');

				this.cycles++;

				var MBR;

				if (direct) {
					MBR = parseInt(operand);
					this.log_output('Direct addressing: set MBR to operand of current instruction: ' + operand);
					document.getElementById('MBR').value = MBR;
				} else {
					MBR = parseInt(document.getElementById('memory_location_' + operand).value);
					this.log_output('Set MAR to operand of the current instruction: ' + operand);
					this.log_output('Fetch data at location held by MAR (' + operand + ') and store it in MBR: ' + MBR);
					document.getElementById('MAR').value = operand;
					document.getElementById('MBR').value = MBR;
				};

				document.getElementById('accumulator').value = MBR;
				this.log_output('Store MBR value in Accumulator: ' + MBR);

			} else if (opcode == '3') { // store accumulator value in memory

				this.log_output('STA');
				this.log_output('Executing instruction...');

				this.cycles++;
				this.log_output('Set MAR to operand of the current instruction: ' + operand);

				var MBR = parseInt(document.getElementById('accumulator').value);

				this.log_output('Set MBR to value held in Accumulator: ' + MBR);
				this.log_output('Store MBR value ' + MBR + ' at memory location held in MAR: ' + operand);

				document.getElementById('MAR').value = operand;
				document.getElementById('MBR').value = MBR;
				document.getElementById('memory_location_' + operand).value = MBR;

			} else if (opcode == '6') { // always branch

				this.log_output('BRA');
				this.log_output('Executing instruction...');

				this.cycles++;

				document.getElementById('PC').value = operand;
				this.program_counter = parseInt(operand);
				this.log_output('Set PC to operand of instruction: ' + operand);

			} else if (opcode == '7') { // branch if zero

				this.log_output('BRZ');
				this.log_output('Executing instruction...');

				this.cycles++;

				this.log_output('Check if value held in Accumulator is 0');

				if (accumulator == 0) {
					this.log_output('0 == 0 - true');
					this.log_output('Set PC to operand of instruction: ' + operand);
					document.getElementById('PC').value = operand;
					this.program_counter = parseInt(operand);
				} else {
					this.log_output(accumulator + ' == 0 - false');
				};

			} else if (opcode == '8') { // branch if positive or 0

				this.log_output('BRP');
				this.log_output('Executing instruction...');

				this.cycles++;

				this.log_output('Check if value held in Accumulator is positive (>= 0)');

				if (accumulator >= 0) {
					this.log_output(accumulator + ' >= 0 - true');
					this.log_output('Set PC to operand of instruction: ' + operand);
					document.getElementById('PC').value = operand;
					this.program_counter = parseInt(operand);
				} else {
					this.log_output(accumulator + ' >= 0 - false');
				};
			};
		};

	};

	step() {

		// clearInterval(this.carry_on);
		this.paused = true;
		// document.getElementById('pausebtn').innerHTML = '<i class="fa fa-play"></i>';
		this.process_instruction();

	};

	run() {

		// clearInterval(this.carry_on);
		this.cycles = 0;
		this.stop = false;

		this.reset_all_registers();
		this.reset_all_inp_out();

		this.scan_code();

		// this.clock = document.getElementById('clock').value;
		this.paused = false;
		// document.getElementById('pausebtn').innerHTML = '<i class="fa fa-pause"></i>';
		// this.carry_on = setInterval(this.process_instruction(), parseInt(this.time_lapse / this.clock));

		while (!this.stop) {
			this.process_instruction();
		};

	};

	pause() {

		if (!this.paused) {
			
			// clearInterval(this.carry_on);
			this.paused = true;
			// document.getElementById("pausebtn").innerHTML = '<i class="fa fa-play"></i>';

		} else {
			
			this.paused = false;
			document.getElementById("pausebtn").innerHTML = '<i class="fa fa-pause"></i>';

			if (this.cycles == 0) {
				this.run();
			} else {
				// clock = document.getElementById("clock").value;
				this.carry_on = setInterval(this.process_instruction(), parseInt(this.time_lapse / this.clock));
			};

		};
	};

	// select_program() {
	// 	if (confirm("This operation will overwrite your current program. Are you sure you want to continue?")) {
	// 		var option = document.getElementById("files").options[document.getElementById("files").selectedIndex].value;
	// 		document.getElementById("codeListing").value = document.getElementById("code" + option).value;
	// 		load();
	// 	}
	// };

	// assembly_code_error(line_no, message) {
	// 	document.getElementById('verbose_output').value += 'Error at line ' + line_no.toString() + ': ' + message;
	// };

	// load() {

	// 	// assuming everything is correctly formatted because this function will not be called unless there are no errors in the assembly code editor
	// 	// * NOTE: if user is manually entering values in to RAM, then load function is not used, but that still needs to be checked!

	// 	// reset all registers (general purpose and special purpose)
	// 	this.reset_all_registers();
	// 	// reset all inputs / outputs / displays
	// 	this.reset_all_inp_out();
	// 	// reset RAM
	// 	this.reset_RAM();
	// 	// reset general registers
	// 	this.reset_general_registers();

	// 	// load program in RAM
	// 	var lines = $('#code_area').children('div');

	// 	// get numerical values to represent each label (not line)
	// 	var list_of_labels = Object.keys(this.labels);
	// 	for (var i = 0; i < list_of_labels.length; i++) {
	// 		this.label_order[list_of_labels[i]] = i + 1;
	// 	};

	// 	// ? Because JavaScript is stupid, define local variables to store all necessary information in the lines and curr_line_as_arr each and forEach function, and then once those functions are finished running, set this.values to the values of the local variables (because can't go up the scope for `this` keyword)
	// 	var curr_RAM = this.RAM;
	// 	var curr_RAM_value_length = this.RAM_value_length;
	// 	var curr_label_order = this.label_order;
	// 	var curr_instruction_set = this.instruction_set;

	// 	lines.each(function (line_index) {

	// 		var curr_line = lines[line_index].innerHTML;

	// 		if (curr_line.length >= 1) { // something in the line

	// 			// regex to replace unnecessary spans and &nbsp; (makes sure that nothing changes even if line has been syntax highlighted before)
	// 			curr_line = curr_line.replace(/<\/?span[^>]*>/g, "");
	// 			curr_line = curr_line.replace(/&nbsp;/g, ' ');
	// 			curr_line = curr_line.replace(/\/?color="[^"]*">/g, ' ');
	// 			curr_line = curr_line.replace(/\/?style="[^"]*">/g, ' ');

	// 			curr_line_as_arr = curr_line.replace(/[\s]+/g, ' ').trim().split(' ');

	// 			var word_counter = 0;

	// 			curr_line_as_arr.forEach(function (each_word) {

	// 				// get next free location in RAM
	// 				var next_free_location;
	// 				for (var i = 0; i < curr_RAM.length; i++) {
	// 					if (curr_RAM[i] == '0'.repeat(curr_RAM_value_length)) {
	// 						next_free_location = i;
	// 						break;
	// 					};
	// 				};

	// 				// loops
	// 				if (each_word.slice(0, -1) in curr_label_order) {
	// 					curr_RAM[next_free_location] = (curr_instruction_set['VAR'].numerical_value + curr_label_order[each_word.slice(0, -1)]).toString();
	// 				} else { // 

	// 					if (word_counter == 0) {
	// 						curr_RAM[next_free_location] = curr_instruction_set[each_word].numerical_value.toString();
	// 						this.RAM_backend_to_RAM_value_length_digits(next_free_location);
	// 					}

	// 				};

	// 				word_counter++;

	// 			});
	// 		}

	// 	});

	// 	this.RAM = curr_RAM;
	// 	this.RAM_value_length = curr_RAM_value_length;
	// 	this.label_order = curr_label_order;
	// 	this.instruction_set = curr_instruction_set;

	// 	this.load_RAM_from_backend();

	// };

};


// functions to initialize values

// create instruction and LMC objects
function initialise_LMC() {

	// ! CHANGE NUMERICAL VALUE TO BE A STRING

	// var HALT = new Instruction({
	// 	name: 'HALT',
	// 	numerical_value: 0,
	// 	operands: []
	// });
	// var LDR = new Instruction({
	// 	name: 'LDR',
	// 	numerical_value: 10,
	// 	operands: ['R', 'M']
	// });
	// var STR = new Instruction({
	// 	name: 'STR',
	// 	numerical_value: 11,
	// 	operands: ['R', 'M']
	// });
	// var MOV = new Instruction({
	// 	name: 'MOV',
	// 	numerical_value: 12,
	// 	operands: ['R', 'B']
	// });
	// var ADD = new Instruction({
	// 	name: 'ADD',
	// 	numerical_value: 20,
	// 	operands: ['R', 'R', 'B']
	// });
	// var SUB = new Instruction({
	// 	name: 'SUB',
	// 	numerical_value: 21,
	// 	operands: ['R', 'R', 'B']
	// });
	// var B = new Instruction({
	// 	name: 'B',
	// 	numerical_value: 30,
	// 	operands: ['L']
	// });
	// var BEQ = new Instruction({
	// 	name: 'BEQ',
	// 	numerical_value: 31,
	// 	operands: ['L']
	// });
	// var BNE = new Instruction({
	// 	name: 'BNE',
	// 	numerical_value: 32,
	// 	operands: ['L']
	// });
	// var BGT = new Instruction({
	// 	name: 'BGT',
	// 	numerical_value: 33,
	// 	operands: ['L']
	// });
	// var BLT = new Instruction({
	// 	name: 'BLT',
	// 	numerical_value: 34,
	// 	operands: ['L']
	// });
	// var CMP = new Instruction({
	// 	name: 'CMP',
	// 	numerical_value: 35,
	// 	operands: ['R', 'B']
	// });
	// var AND = new Instruction({
	// 	name: 'AND',
	// 	numerical_value: 40,
	// 	operands: ['R', 'R', 'B']
	// });
	// var ORR = new Instruction({
	// 	name: 'ORR',
	// 	numerical_value: 41,
	// 	operands: ['R', 'R', 'B']
	// });
	// var EOR = new Instruction({
	// 	name: 'EOR',
	// 	numerical_value: 42,
	// 	operands: ['R', 'R', 'B']
	// });
	// var MVN = new Instruction({
	// 	name: 'MVN',
	// 	numerical_value: 43,
	// 	operands: ['R', 'B']
	// });
	// var LSL = new Instruction({
	// 	name: 'LSL',
	// 	numerical_value: 44,
	// 	operands: ['R', 'R', 'B']
	// });
	// var LSR = new Instruction({
	// 	name: 'LSR',
	// 	numerical_value: 45,
	// 	operands: ['R', 'R', 'B']
	// });
	// var INP = new Instruction({
	// 	name: 'INP',
	// 	numerical_value: 50,
	// 	operands: []
	// });
	// var OUT = new Instruction({
	// 	name: 'OUT',
	// 	numerical_value: 51,
	// 	operands: []
	// });
	// var VAR = new Instruction({
	// 	name: 'VAR',
	// 	numerical_value: 900,
	// 	operands: []
	// });

	// var instruction_set = {
	// 	'LDR': LDR,
	// 	'STR': STR,
	// 	'ADD': ADD,
	// 	'SUB': SUB,
	// 	'MOV': MOV,
	// 	'CMP': CMP,
	// 	'B': B,
	// 	'BEQ': BEQ,
	// 	'BNE': BNE,
	// 	'BGT': BGT,
	// 	'BLT': BLT,
	// 	'AND': AND,
	// 	'ORR': ORR,
	// 	'EOR': EOR,
	// 	'MVN': MVN,
	// 	'LSL': LSL,
	// 	'LSR': LSR,
	// 	'INP': INP,
	// 	'OUT': OUT,
	// 	'HALT': HALT,
	// 	'VAR': VAR
	// };

	// ! OPERANDS WILL NOT BE USED FOR INITIAL TRANSLATION - WILL HAVE TO LATER FIGURE OUT HOW TO DO EVERYTHING USING THE GENERAL PURPOSE REGISTERS
	
	var INP = new Instruction({ // get user input + store in accumulator
		name: 'INP',
		numerical_value: '901',
		operands: []
	});
	var OUT = new Instruction({ // output value stored in accumulator
		name: 'OUT',
		numerical_value: '902',
		operands: []
	});
	var LDA = new Instruction({ // load accumulator w/ contents of given RAM address
		name: 'LDA',
		numerical_value: '5',
		operands: ['M']
	});
	var STA = new Instruction({ // store value in accumulator to RAM address OR register
		name: 'STA',
		numerical_value: '3',
		operands: ['B']
	});
	var ADD = new Instruction({ // add accumulator value to RAM address value OR register value
		name: 'ADD',
		numerical_value: '1',
		operands: ['B']
	});
	var SUB = new Instruction({ // subtract contents of RAM address OR register contents from accumulator value
		name: 'SUB',
		numerical_value: '2',
		operands: ['B']
	});
	var BRP = new Instruction({ // branch to RAM address if accumulator value is zero or positive
		name: 'BRP',
		numerical_value: '8',
		operands: ['M']
	});
	var BRZ = new Instruction({ // branch to RAM address if accumulator value is zero
		name: 'BRZ',
		numerical_value: '7',
		operands: ['M']
	});
	var BRA = new Instruction({ // branch to RAM address
		name: 'BRA',
		numerical_value: '6',
		operands: ['M']
	});
	var HLT = new Instruction({ // stop assembly code
		name: 'HLT',
		numerical_value: '000',
		operands: []
	});
	var DAT = new Instruction({ // associates a label to a free RAM address. optional value used to store at RAM address
		name: 'DAT',
		numerical_value: '', // will be 4 or something like that
		operands: [] // will be number, RAM address
	});

	var instruction_set = {
	'INP': INP,
	'OUT': OUT,
	'LDA': LDA,
	'STA': STA,
	'ADD': ADD,
	'SUB': SUB,
	'BRP': BRP,
	'BRZ': BRZ,
	'BRA': BRA,
	'HLT': HLT,
	'DAT': DAT
	};

	RAM = [];
	var RAM_value_length = 4;

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
};

// create leader-lines for address, control, & data buses
function create_buses() {

	address_bus = new LeaderLine(
		document.getElementById('MAR_wrapper'),
		LeaderLine.pointAnchor(document.getElementById('memory_10_wrapper'), {
			x: 0,
			y: '19%'
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
			y: '99%'
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

// on loading the page
window.addEventListener('load', function () {
	// draw leaderlines for 3 buses
	create_buses();
	// disable spellcheck for all input/output fields
	$('body').attr("spellcheck", false);
});

// run everytime anything on the page is clicked
window.addEventListener('click', function () {

	LMC.load_RAM_from_frontend();
	LMC.load_general_registers_from_backend();

	// // BELOW WORKS
	// control_bus.setOptions({
	// 	end: document.getElementById('memory_98_wrapper'),
	// 	path: 'fluid'
	// });
});


// all other initialisations / scripts

// create line numbers for assembly code area
var assembly_code_area = document.getElementById('code_area');
var line_numbers = document.querySelector('.line-numbers');
assembly_code_area.addEventListener('keyup', event => {
	var number_of_lines = event.target.value.split('\n').length;
	line_numbers.innerHTML = Array(number_of_lines).fill('<span></span>').join('');
});
$(document).ready(function () {
	var number_of_lines = assembly_code_area.value.split('\n').length;
	line_numbers.innerHTML = Array(number_of_lines).fill('<span></span>').join('');
});

// make line numbers scroll with assembly code area
(function ($) {

	var methods = {

		/**
		 * @var options default options
		 */
		options: {
			/**
			 * @var eventTimeOut time in milliseconds 
			 */
			eventTimeOut: 200,

			/**
			 * @var scrollSpeed time in milliseconds the other light boxes should take to scroll to their relevant point.
			 */
			scrollSpeed: 100
		},

		/**
		 * init
		 *
		 * method that applies brings everything together
		 *
		 * @param options object an object that overwrites the default options
		 * @return null
		 */
		init: function (options) {
			// overwrite defaults
			$.extend(methods.options, options);

			/**
			 * @var $this object cached global jQuery variable
			 */
			var $this = $(this);

			// Assign IDs. Used to prevent jittering of element that is calling.
			var id_num = 0;
			$(this).each(function () {
				$(this).data("scrollid", id_num);
				id_num++;
			});

			// bind on scroll
			var callback = function (el) {

				var
					/**
					 * @var scroll_percent number percentage of top of element scrolled
					 */
					scroll_percent = methods.convertScrollToPercent.call(el),
					/**
					 * @var me number scroll id of element calling the scroll method
					 */
					me = el.data("scrollid");

				// Loop through each
				$.each($this, function () {
					// Set scroll to false to prevent this element from calling same event
					$(this).data("scroll", false);
					// if it's the same element, skip
					if (me !== $(this).data("scrollid")) {
						// Scroll the element to percent
						methods.scrollToPercent.call(this, scroll_percent);
					}
					// Turn scroll back on
					$(this).data("scroll", true);
				});

			}

			// Assign scroll handler
			$(this).scroll(function (event) {
				/**
				 * @var scroll_on boolean get scroll data value to see if it's safe to scroll
				 */
				var scroll_on = $(this).data("scroll");

				// cancel call if it's not safe
				if (scroll_on == false) return;

				// Call method callback 
				callback($(this));
			});

		},

		/**
		 * convertScrollToPercent
		 *
		 * converts the scroll position to percent and returns it.
		 *
		 * @return number the percentage (duh)
		 */
		convertScrollToPercent: function () {
			// Defaults

			var
				horrizontal = $(this).data("horizontal") || false,
				scrollStyle = (horrizontal != false ? "scrollLeft" : "scrollTop"),
				scrollWidth = (horrizontal != false ? "scrollWidth" : "scrollHeight");
			// get top and scroll position

			var
				top = $(this)[scrollStyle](),
				height = (horrizontal ? $(this)[0].scrollWidth - $(this).width() : $(this)[0].scrollHeight - $(this).height());

			// console.log("top :" + top + ", height :" + height);
			// height == 100 then what does top equal? ()
			var
				answer = 100 * top,
				answer = answer / height

			//   return answer;
			return Math.round(answer);

		},

		/**
		 * scrollToPercent
		 *
		 * This method takes a percent and scrolls an element to that given point.
		 *
		 * @param percent numher the percent to which the element will be scrolled to.
		 */
		scrollToPercent: function (percent) {

			var
				/**
				 * @var horrizontal boolean what type of scroll to use. Horizontal or vertical
				 */
				horrizontal = $(this).data("horizontal") || false,
				/**
				 * @var height number the height or width of the element
				 */
				height = (horrizontal ? $(this)[0].scrollWidth - $(this).width() : $(this)[0].scrollHeight - $(this).height()),
				// Perform equation to determin relative scroll positon
				answer = percent * height,
				/**
				 * @var answer number the top or left position
				 */
				answer = answer / 100;

			// scroll element to answer position
			if (horrizontal == true) {
				$(this).scrollLeft(answer);
			}
			else {
				$(this).scrollTop(answer);
			}
		}
	}

	/**
	 * bindScroll
	 *
	 * a jqeury plugin that will bind the scroll to the given elements.
	 * each element should have a data attribute called scrollid. This
	 * will let the plugin know not to apply the scrolling bind to that active
	 * element. If element is to be a horizontal scroll, specify by setting
	 * data-horizontal attribute to true.
	 *
	 * @param options object object with options (currently no options exist);
	 * @return object returns the jQuery DOM object to maintain chainability
	 */
	$.fn.bindScroll = function (options) {
		methods.init.call(this, options);
		return this;
	}

})($);
$(document).ready(function () {
	// apply bindScroll to all elements with .scroll.
	$(".scroll_together").bindScroll();
});

// syntax highlighting for assembly code area
// list of names of all instructions in instruction set (but not 'VAR' - only for RAM to know where loops start, not an actual opcode)
var opcode_words = Object.keys(LMC.instruction_set).slice(0, -1);
// ! SYNTAX HIGHLIGHTING FOR 3 AND 4 WORD LINES STILL LEFT
$('#code_area').on('keyup', function (key) {
	// space key pressed - syntax highlighting
	if (key.keyCode == 32) {

		LMC.reset_verbose_output();

		// store loop names as keys with their values as the line number they exist at
		var labels = {};
		var errors = [];

		var lines = $(this).children('div');

		lines.each(function (line_index) {

			var new_HTML = '';
			var curr_line = lines[line_index].innerHTML;

			if (curr_line.length >= 1) { // something in the line

				// regex to replace unnecessary spans and &nbsp; (makes sure that nothing changes even if line has been syntax highlighted before)
				curr_line = curr_line.replace(/<\/?span[^>]*>/g, "");
				curr_line = curr_line.replace(/&nbsp;/g, ' ');
				curr_line = curr_line.replace(/\/?color="[^"]*">/g, ' ');
				curr_line = curr_line.replace(/\/?style="[^"]*">/g, ' ');

				curr_line_as_arr = curr_line.replace(/[\s]+/g, ' ').trim().split(' ');

				if (curr_line_as_arr.length == 1) {

					curr_line_as_arr.forEach(function (each_word) {

						var opcode_words_with_no_operands = Object.keys(LMC.instruction_set).filter(key => LMC.instruction_set[key].operands.length === 0).slice(0, -1);

						if (each_word.slice(-1) == ':') { // loops

							labels[each_word.slice(0, -1)] = line_index;
							new_HTML += '<span class="loop_highlight">' + each_word.slice(0, -1) + '</span>';
							new_HTML += '<span class="other_highlight">:&nbsp;</span>';

						} else if (opcode_words_with_no_operands.includes(each_word.toUpperCase())) { // valid opcode from INP, OUT, HALT

							if (opcode_words.includes(each_word)) { // correctly capitalised opcode
								new_HTML += '<span class="command_highlight">' + each_word + '&nbsp;</span>';
							} else { // incorrectly capitalised opcode
								new_HTML += '<span class="error_highlight">' + each_word + '&nbsp;</span>';
								errors.push([line_index + 1, 'opcode not capitalised']);
							};

						} else { // no other valid 1 word lines

							if (opcode_words.includes(each_word.toUpperCase())) { // missing operands for an opcode
								new_HTML += '<span class="error_highlight">' + each_word + '&nbsp;</span>';
								errors.push([line_index + 1, 'missing operands for opcode ' + each_word.toUpperCase()]);
							} else { // some other unknown error
								new_HTML += '<span class="error_highlight">' + each_word + '&nbsp;</span>';
								errors.push([line_index + 1, 'invalid instruction']);
							};

						};

					});

				} else if (curr_line_as_arr.length == 2) {

					var opcode_words_with_1_operand = Object.keys(LMC.instruction_set).filter(key => LMC.instruction_set[key].operands.length === 1);

					var word_counter = 0;
					var specific_error = false;

					curr_line_as_arr.forEach(function (each_word) {

						if (word_counter == 0) { // first word in the line

							if (opcode_words_with_1_operand.includes(each_word.toUpperCase())) {

								if (opcode_words.includes(each_word)) { // correctly capitalised opcode

									if (each_word == opcode_words_with_1_operand[0]) { // condition-less branch
										new_HTML += '<span class="branch_highlight">' + each_word + '&nbsp;</span>';
									}
									else { // branch with condition

										if (line_index == 0) { // branch with condition cannot be the first line
											new_HTML += '<span class="error_highlight">' + each_word + '&nbsp;</span>';
											errors.push([line_index + 1, 'branch cannot be the first opcode']);
										} else {

											// ! NOTE: MAY WANT TO INSTEAD DO A CHECK AFTER CMP FOR B<condition> WITH A TRY FOR THE NEXT LINE, IF ERROR, CLEARLY NO NEXT LINE AND ADD AN ERROR THAT CMP MUST BE FOLLOWED BY BEQ, BLT, BGT, OR BNE, AND IF THERE, DO THE HIGHLIGHTING OF THAT, AND FIND A WAY TO SKIP OR POTENTIALLY JUST GO STRAIGHT TO IT

											// previous line operand must be CMP
											prev_line = lines[line_index - 1].innerHTML;

											prev_line = prev_line.replace(/<\/?span[^>]*>/g, "");
											prev_line = prev_line.replace(/&nbsp;/g, ' ');
											prev_line = prev_line.replace(/\/?color="[^"]*">/g, ' ');
											prev_line = prev_line.replace(/\/?style="[^"]*">/g, ' ');

											prev_line_as_arr = prev.replace(/[\s]+/g, ' ').trim().split(' ');

											if (prev_line_as_arr[0] == 'CMP') { // no errors and previous line is correct
												new_HTML += '<span class="branch_highlight">' + each_word + '&nbsp;</span>';
											} else { // error related to CMP
												new_HTML += '<span class="error_highlight">' + each_word + '&nbsp;</span>';
												errors.push([line_index + 1, 'CMP required in previous line']);
											};

										};
									};

								} else { // incorrectly capitalised opcode
									new_HTML += '<span class="error_highlight">' + each_word + '&nbsp;</span>';
									errors.push([line_index + 1, 'opcode not capitalised']);
								};

							} else { // no other valid 2 word lines

								if (opcode_words.includes(each_word.toUpperCase())) { // missing operands for an opcode
									new_HTML += '<span class="error_highlight">' + each_word + '&nbsp;</span>';
									errors.push([line_index + 1, 'missing operands for opcode ' + each_word.toUpperCase()]);
								} else { // some other unknown error
									new_HTML += '<span class="error_highlight">' + each_word + '&nbsp;</span>';
									errors.push([line_index + 1, 'invalid instruction']);
								};

							};

						} else { // second word in the line

							for (var i = 0; i < errors.length; i++) {
								if (errors[i][0] == line_index + 1) {
									specific_error = true;
								};
							};

							if (!specific_error) { // no errors from previous word

								if (Object.keys(labels).includes(each_word)) {
									new_HTML += '<span class="loop_highlight">' + each_word + '</span>';
								} else {
									new_HTML += '<span class="error_highlight">' + each_word + '&nbsp;</span>';
									errors.push([line_index + 1, 'loop name not found']);
								};

							} else { // cannot check for error here if previous word incorrect
								new_HTML += '<span class="error_highlight">' + each_word + '&nbsp;</span>';
								errors.push(line_index + 1, 'error with opcode');
							};
						};

						word_counter++;

					});

				} else if (curr_line_as_arr.length == 3) {



				} else if (curr_line_as_arr.length == 4) {



				} else {

					curr_line_as_arr.forEach(function (each_word) {
						new_HTML += '<span class="error_highlight">' + each_word + '&nbsp;</span>';
					});

					errors.push([line_index + 1, 'too many variables in the line']);

				};

				new_div = document.createElement('div');
				new_div.innerHTML = new_HTML;

				lines[line_index].replaceWith(new_div);

			} else { // nothing in the line
				if (line_index != 0) {
					// only remove line if not the very first line
					lines[line_index].remove();
				};
			}

			// set cursor position to end of text
			var child = $('#code_area').children().children();
			var range = document.createRange();
			var select = window.getSelection();

			try {

				range.setStart(child[child.length - 1], 1);
				range.collapse(true);
				select.removeAllRanges();
				select.addRange(range);
				$('#code_area').focus();

			} catch (error) {
				alert(error);
			}

		});

		if (errors.length != 0) { // there is at least 1 error	
			// remove duplicates
			errors = [...new Map(errors)];

			// output errors to verbose output
			for (var i = 0; i < errors.length; i++) {
				LMC.assembly_code_error(errors[i][0], errors[i][1] + '\n');
			}
		};

		// store in LMC object
		LMC.errors = errors;
		LMC.labels = labels;

	}
});
// allow tabs in assembly code area
document.getElementById('code_area').addEventListener('keydown', function (key) {
	if (key.keyCode == 9) {

		// get caret position / selection
		var start = this.selectionStart;
		var end = this.selectionEnd;

		var target = key.target;
		var value = target.value;

		// set textarea value to `text before caret` + tab + `text after caret`
		target.value = value.substring(0, start) + '\t' + value.substring(end);

		// put caret at right position again (add 1 for tab)
		this.selectionStart = this.selectionEnd = start + 1;

		// prevent losing focus
		key.preventDefault();

	};
}, false);

// ! NO TABs IN ASSEMBLY TEXT AREA
// // add &emsp; - 2 spaces for a tab
// function insert_tab() {

// 	var selection = window.getSelection();
// 	var node = selection.anchorNode;
// 	var text = node.textContent.slice(0, selection.focusOffset);

// 	alert(selection.toString());
// 	alert(node);
// 	alert(text);

// }

// // tab pressed - don't go to next element, insert a tab as if writing code
// $('#code_area').on('keydown', function (key) {
// 	if (key.keyCode == 9) {
// 		// add tab
// 		insert_tab();
// 		// prevent focusing on next element
// 		key.preventDefault();
// 	}
// });


// window.addEventListener('load', function () {
// 	this.alert(opcode_words);
// 	this.alert(typeof opcode_words);
// 	this.alert(opcode_words.at(-1));
// 	this.alert(typeof opcode_words.at(-1));
// })


// functions called from HTML buttons

// remove all text froma assembly code editor
function clear_editor() {
	document.getElementById('code_area').value = '';
};

// set all values in RAM back to 00
function reset_RAM(LMC) {
	LMC.reset_RAM();
	LMC.reset_all_registers();
	LMC.reset_all_inp_out();
	LMC.stop = false;
};

// open new tab with /instruction_set 
function open_link_new_tab(location) {

	// ternary operator used in case window.location doesn't include '/', works as follows:
	// bool_expr ? result_if_bool_expr_true : result_if_bool_expr_false;
	var redirect_to = window.location.toString() + (window.location.toString().includes('/') ? location : ('/' + location));

	window.open(redirect_to, '_blank');
};

// ! WILL NOT DO THIS - THIS IS JUST AN EXAMPLE FOR FUTURE USE IN LMC METHOD
function upload_program(LMC) {
	// LMC.activate_deactivate_wrapper('ALU_wrapper');
	// LMC.activate_deactivate_wrapper('memory_01_wrapper');
};

function load_into_RAM(LMC) {
	LMC.load();
};
function run_program(LMC) {
	
	if (LMC.RAM[0] == '0000') {
		load_into_RAM(LMC);
	};

	if (!LMC.stop) {
		LMC.run();
	} else {
		alert('Program finished. To re-run, please reset RAM and load the program into RAM again.');
	};

};
function step_program(LMC) {
	
	if (LMC.RAM[0] == '0000') {
		load_into_RAM(LMC);
	};

	if (!LMC.stop) {
		LMC.step();
	} else {
		alert('Program finished. To re-run, please reset RAM and load the program into RAM again.');
	};

};
