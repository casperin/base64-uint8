# Base64 encoder

This package encodes and decodes `Uint8Array`s to and from strings.

There are no dependencies. It does not use `atob` or `buffer`. The input for
the encoding can be any old array of numbers between 0 and 255 if you like, but
the output of the decoding will be a `Uint8Array`.

[The code](./index.js) is written with lots of comments and follows an example
from Wikipedia to make it all easier to understand and learn from.

Simple code also usually means performant code, so I suspect this
implementation is quite performant as well.

I wrote it as a quick learning project for myself.


## Usage

```js
import fs from "fs";
import { encode, decode } from './index.js';

// Buffer with the content of this README.md
const readme_bytes = fs.readFileSync("./README.md");

// Base64 string
const readme_encoded = encode(readme_bytes);

// Uint8Array that equals readme_bytes (except buffer != Uint8Array)
const readme_decoded = decode(readme_encoded);
```
