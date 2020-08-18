let ob1 = [
  { fName: "Ronnie", lName: "Geraghty" },
  { fName: "Sophie", lName: "Collin" },
];

let ob2 = {
  fName: "James",
  lName: "Geraghty",
};

let ob1String = JSON.stringify(ob1);
let ob2String = JSON.stringify(ob2);

console.log(`OB1: ${ob1String}`);
console.log(`OB2: ${ob2String}`);
