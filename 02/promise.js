import fs from 'fs/promises'


let a = await fs.readFile('mustafa2.txt')

console.log(a.toString())