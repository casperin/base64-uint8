import fs from "fs";
import { encode, decode } from "./index.js"

const TEST_COUNT = 100;

function random_array(length) {
    return Array.from({length}, () => parseInt(Math.random() * 255, 10));
}

// byte array -> string -> byte array
for (let i = 0; i < TEST_COUNT; i++) {
    const input_array = random_array(i * 10);
    const input = Uint8Array.from(input_array);
    const input_encoded = encode(input);
    const input_decoded = decode(input_encoded);

    for (let j = 0; j < input.length; j++) {
        if (input[j] !== input_decoded[j]) {
            console.error(input)
            throw new Error("The above input failed at index: " + j)
        }
    }
}

// From known byte array to known string
const known = {
    TWFu: [77, 97, 110],
};

for (const str in known) {
    const byte_array = Uint8Array.from(known[str]);
    const encoded = encode(byte_array);

    if (str !== encoded) {
        throw new Error(str + " failed! I got " + encoded);
    }
}

// Test it on an actual file
const readme_bytes = fs.readFileSync("./README.md"); // Buffer inherits from Uint8Array
const readme_encoded = encode(readme_bytes);
const readme_decoded = decode(readme_encoded);

for (let j = 0; j < readme_bytes.length; j++) {
    if (readme_bytes[j] !== readme_decoded[j]) {
        throw new Error("README failed :(")
    }
}

console.log("ok")

