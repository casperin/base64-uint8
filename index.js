export { encode, decode };

// https://en.wikipedia.org/wiki/Base64#Base64_table
const chars = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "W", "X", "Y", "Z",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
    "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
    "u", "v", "w", "x", "y", "z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "+", "/",
];

function encode(bytes) {
    let i = 2,
        b1, b2, b3,             // input bytes
        _1, _2,                 // partial results
        c1, c2, c3, c4,         // encoded characters
        output = "";

    // We encode in chunks of 3.
    // The example used in the code, follows the one they use in the Wikipedia
    // article, of enoceding "Man" to "TWFu".
    for (; i < bytes.length; i = i + 3) {
        b1 = bytes[i - 2];      // 01001101 "M" | 77
        b2 = bytes[i - 1];      // 01100001 "a" | 97
        b3 = bytes[i];          // 01101110 "n" | 110

        c1 = chars[b1 >> 2];    // xx010011 -> chars[19] = "T"

        _1 = (b1 & 3) << 4;     // 0001xxxx -- Last 2 bits of "M", shifted 4 bits. 3 = 00000011
        _2 = b2 >> 4;           // xxxx0110 -- First 4 bits of "a"
        c2 = chars[_1 | _2];    // 00010110 --> chars[22] = "W"

        _1 = (b2 & 15) << 2;    // 000001xx -- Last 4 bits of "a", shifted 2 bits. 15 = 00001111
        _2 = b3 >> 6;           // xxxxxx01 -- First 2 bits of "n"
        c3 = chars[_1 | _2];    // 00000101 -> chars[5] = "F"

        c4 = chars[b3 & 63];    // 00101110 -> chars[46] = "u". Last 6 bits of "n". 63 = 00111111

        output += (c1 + c2 + c3 + c4);
    }

    if (i === bytes.length) {   // Missing 1 byte
        b1 = bytes[i - 2];
        b2 = bytes[i - 1];
        c1 = chars[b1 >> 2];
        c2 = chars[((b1 & 3) << 4) | (b2 >> 4)];
        c3 = chars[(b2 & 15) << 2];
        output += (c1 + c2 + c3 + "=");

    } else if (i === bytes.length + 1) { // Missing 2 bytes
        b1 = bytes[i - 2];
        c1 = chars[b1 >> 2];
        c2 = chars[((b1 & 3) << 4)];
        output += (c1 + c2 + "==");
    }

    return output;
}

const charCode2Index = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1,
    62,                                     // +
    -1, -1, -1,
    63,                                     // /
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, // 0-9
    -1, -1, -1,
    0,                                      // =
    -1, -1, -1,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,           // A-J
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19, // K-T
    20, 21, 22, 23, 24, 25,                 // U-Z
    -1, -1, -1, -1, -1, -1,
    26, 27, 28, 29, 30, 31, 32, 33, 34, 35, // a-j
    36, 37, 38, 39, 40, 41, 42, 43, 44, 45, // k-t
    46, 47, 48, 49, 50, 51                  // u-z
];

function decode(input) {
    const input_length = input.length;
    const output_length = input_length / 4 * 3;
    if (output_length !== (output_length | 0)) {
        throw new Error("Input is not a valid base64 encoding.");
    }
    const output = new Uint8Array(output_length);
    let c1, c2, c3, c4,
        i = 3, j = 0;

    for (; i < input.length; i += 4) {
        c1 = charCode2Index[input.charCodeAt(i - 3)]; // 00010011 = 19 = T
        c2 = charCode2Index[input.charCodeAt(i - 2)]; // 00010110 = 22 = W
        c3 = charCode2Index[input.charCodeAt(i - 1)]; // 00000101 =  5 = F
        c4 = charCode2Index[input.charCodeAt(i)];     // 00101110 = 46 = u

        if (c1 === -1 || c1 === undefined) barf(input, i - 3);
        if (c2 === -1 || c2 === undefined) barf(input, i - 2);
        if (c3 === -1 || c3 === undefined) barf(input, i - 1);
        if (c4 === -1 || c4 === undefined) barf(input, i);

        output[j++] = c1 << 2 | c2 >> 4; // 010011xx | xxxx0001 = 01001101 =  77 = M
        output[j++] = c2 << 4 | c3 >> 2; // 0110xxxx | xx000001 = 01100001 =  97 = a
        output[j++] = c3 << 6 | c4;      // 01xxxxxx | 00101110 = 01101110 = 110 = n
    }

    if (input[input_length - 1] === "=") {
        const padding = input[input_length - 2] === "=" ? 2 : 1;
        return output.subarray(0, output_length - padding);
    }

    return output;
}

function barf(s, i) {
    throw new Error(`Not a valid base64 string. Found "${s[i]}" at index ${i}.`);
}
