// code for translation to get output + visualise it

// EXECUTION CYCLE
// check Program Counter for mailbox number containing program instruction (0 at start of program)
// fetch instruction from mailbox w/ that number (each instruction contains opcode + address field)
// increment Program Counter (so it contains the mailbox number of the next instruction)
// decode the instruction. if the instruction ultilises data stored in another mailbox, then use the address field to find the mailbox number for the data it will work on (get data from mailbox 42 for example)
// fetch the data (from the input, accumulator, or mailbox w/ the address determined in above step)
// execute the instruction based on the opcode given
// branch or store the result (in the outpt, accumulator, or mailbox w. the address determined 2 steps ago)
// return to the Program Counter to repeat the cycle or halt

class Little_Man_Computer {

	constructor(args) {
		
		this.outputs = [];

		this.inputs = args.inputs || [];
		this.input_index = 0;

		this.memory_locations = args.memory_locations || [];

		this.accumulator = 0;
		this.program_counter = 0;

	};

};
