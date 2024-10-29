# Assembly-Code-Visualiser

This is my AQA A Level Computer Science NEA Project.

> Note: I will consider the project's root directory (`/`) as the `assembly_code_visualiser` folder for the rest of this file.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Project Description](#project-description)
- [Dependencies](#dependencies)
- [Setup](#setup)
- [Run](#run)
- [Testing Video](#testing-video)

## Project Description

It is a web application that has an assembly code editor (based on the AQA 2023 summer assessment specification for A Level Computer Science) and a Little Man Computer visualisation that shows the user what is happening inside the CPU and RAM as the assembly code is run. This website can also be used as a learning tool, with the ability for teachers to have classes of students and assign them (either as a class or individually) challenges / assignments with a due date that must be completed. For example, this would be to write Assembly code that can take 2 integer inputs and return the addition of both those numbers.

For more information about how I created this web app, refer to the [Project Writeup](Project%20Writeup.pdf).

## Dependencies

- Node.js
- Express.js
- Redis
- Database e.g. phpMyAdmin

## Setup

1) Setup a database on localhost or otherwise (database structure can be found in the [Project Writeup](Project%20Writeup.pdf))
2) Setup basic redis store on localhost or otherwise
3) Open `.env.example`
   - Copy its contents to a new file called `.env`
   - Fill out necessary variables
4) Navigate to the root directory folder (`/`) and run `npm install` in the terminal.

## Run

1) Start the database so that it can be accessed as specified in `.env`
   - For me, this means opening up `MAMP` and starting the `assembly_code_visualiser` host
2) Start the redis client/server
   - For me, this means going to terminal and typing `redis-server`
3) Navigate to the root directory of this project and run `nodemon start`
4) Go to a web browser and enter the following in the URL bar: `localhost:3000`

## Testing Video

The testing video, going through all requirements, can be see [here](https://youtu.be/ZfbiDA_2PHk). This is a very long, unlisted video going through all the requirements that were required for the project as needed for the A Level NEA, but can be skipped through to view the core functionalities of the website and act as a demo.
