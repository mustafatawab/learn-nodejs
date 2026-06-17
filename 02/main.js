import fs from "fs";
console.log(fs);

// console.log("starting")
// fs.writeFileSync("mustafa.txt" , "mustafa is best programmer")
// console.log('ended')

fs.writeFile("mustafa2.txt", "I am the best programmer in the world", () => {
  console.log("the file has been created");

  fs.readFile("mustafa.txt", (error, data) => {
    console.log(data.toString());
  }); //when this increases and the code is hard to understand this is called callback hell. Promise the solution for this
});

fs.appendFile("mustafa2.txt", " Are you interest ? ", (error, data) => {
  console.log(data);
  console.log(error);
});

console.log("ending");
