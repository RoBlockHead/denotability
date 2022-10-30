// Adapted from https://deno.land/x/bplist_parser@0.4.0/mod.ts
/**
* Adapted directly from https://github.com/joeferner/node-bplist-parser, which
* is licensed as follows:
*
* (The MIT License)
*
* Copyright (c) 2012 Near Infinity Corporation
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

const decoder = new TextDecoder();
const utf16Decoder = new TextDecoder("utf-16");

// Apple encodes dates starting at an unusual epoch
// This is equal to 978307200000 ms (since the OG epoch)
const appleEpoch = new Date("2001 01 01 GMT").getTime();
const maxObjectSize = 1000 * 1000 * 1000;
const maxObjectCount = 32768
/**
 * bplist files support storing a unique index type (UID), which will be parsed
 * into instances of this class. The ID stored in the bplist is available as the
 * `id` property.
 */
export class UID {
  id: number;
  constructor(id: number) {
    this.id = id;
  }
}

/**
 * Parses a typed array buffer holding a binary property list into an equivalent
 * JavaScript value.
 *
 * For more information about binary property lists, see:
 * https://en.wikipedia.org/wiki/Property_list
 */
export function parseBuffer(buffer: ArrayBufferView) {
    const buf = new Uint8Array(buffer.buffer); // This shouldn't make a copy
    const header = decoder.decode(buf.slice(0, "bplist".length));
    if (header !== "bplist") {
        throw new Error("Invalid binary plist. Expected \"bplist\" at offset 0");
    }

    // The trailer is the last 32 bytes of the file
    const trailer = buf.slice(buf.length - 32);
    // First 6 bytes are null (0-5)
    const offsetSize = trailer[6];
    const objectRefSize = trailer[7];
    const numObjects = readBigUint64(trailer, 8);
    const topObject = readBigUint64(trailer, 16).val;
    const offsetTableOffset = readBigUint64(trailer, 24).val;

    if (numObjects.tooBig) {
        throw new Error("Too many objects (greater than Number.MAX_SAFE_INTEGER)");
    }

    const offsetTable: number[] = [];
    for (let i = 0; i < numObjects.val; i++) {
        const offsetBytes = buf.slice(
        offsetTableOffset + i * offsetSize,
        offsetTableOffset + (i + 1) * offsetSize,
        );
        offsetTable[i] = readUint(offsetBytes);
    }

    const parseObject = (tableOffset: number): unknown => {
        const offset = offsetTable[tableOffset];
        const type = buf[offset];
        const objType = (type & 0xF0) >> 4; // First 4 bits
        const objInfo = (type & 0x0F); // Second 4 bits

        const getIntLengthOffset = () => {
            const _intType = buf[offset + 1];
            const intType = (_intType & 0xF0) / 0x10;
            if (intType !== 0x1) {
                console.error("0xD: UNEXPECTED LENGTH-INT TYPE!", intType);
            }
            const intInfo = _intType & 0x0F;
            const intLength = Math.pow(2, intInfo);
            return {
                length: readUint(buf.slice(offset + 2, offset + 2 + intLength)),
                offset: 2 + intLength,
            };
        };

        const parsePlistString = (isUtf16 = false) => {
            let utf16 = false;
            let length = objInfo;
            let strOffset = 1;
            if (objInfo === 0xF) {
                const lo = getIntLengthOffset();
                length = lo.length;
                strOffset = lo.offset;
            }
            if (isUtf16) {
                length *= 2;
            }
            let plistString = new Uint8Array(buf.slice(
                offset + strOffset,
                offset + strOffset + length,
            ));
            if (isUtf16) {
                plistString = swapBytes(plistString);
                utf16 = true;
            }
            return (
                utf16 ? utf16Decoder.decode(plistString) : decoder.decode(plistString)
            );
        };

        switch (objType) {
        case 0x0: { // Simple
            switch (objInfo) {
            case 0x0:
                return null;
            case 0x8:
                return false;
            case 0x9:
                return true;
            case 0xF: // Filler byte
                return null;
            default:
                throw new Error("Unhandled simple type 0x" + objType.toString(16));
            }
        }

        case 0x1: { // Integer
            const length = Math.pow(2, objInfo);
            const data = buf.slice(offset + 1, offset + 1 + length);
            if (length === 16) {
                const str = readHexString(data);
                return BigInt("0x" + str);
            }
            return data.reduce((acc, curr) => {
                acc <<= 8;
                acc |= curr & 255;
                return acc;
            });
        }

        case 0x8: { // UID
            const length = objInfo + 1;
            return new UID(readUint(buf.slice(offset + 1, offset + 1 + length)));
        }

        case 0x2: { // Real (float)
            const length = Math.pow(2, objInfo);
            const realBuffer = buf.slice(offset + 1, offset + 1 + length);
            if (length === 4) {
                return readFloat32(realBuffer);
            } // else 8
            return readFloat64(realBuffer);
        }

        case 0x3: { // Date
            if (objInfo !== 0x3) {
                console.error("Unknown date type:", objInfo, " - Parsing anyway...");
            }
            const dateBuffer = buf.slice(offset + 1, offset + 9);
            return new Date(appleEpoch + (1000 * readFloat64(dateBuffer)));
        }

        case 0x4: { // Data
            let dataoffset = 1;
            let length = objInfo;
            if (objInfo == 0xF) {
                const int_type = buf[offset + 1];
                const intType = (int_type & 0xF0) / 0x10;
                if (intType != 0x1) {
                console.error("0x4: UNEXPECTED LENGTH-INT TYPE! " + intType);
                }
                const intInfo = int_type & 0x0F;
                const intLength = Math.pow(2, intInfo);
                dataoffset = 2 + intLength;
                if (intLength < 3) {
                    length = readUint(buf.slice(offset + 2, offset + 2 + intLength));
                } else {
                    length = readUint(buf.slice(offset + 2, offset + 2 + intLength));
                }
            }
            if (length < maxObjectSize) {
                return buf.slice(offset + dataoffset, offset + dataoffset + length);
            }
            throw new Error("Too little heap space available! Wanted to read " + length + " bytes, but only " + maxObjectSize + " are available.");
                
            
            // if (objInfo === 0xF) {
            
            //   const lo = getIntLengthOffset();
            //   length = lo.length;
            //   dataOffset = lo.offset;
            // }
            break;
        }

        case 0x5: { // ASCII
            return parsePlistString();
        }

        case 0x6: { // UTF-16
            return parsePlistString(true);
        }

        case 0xA: { // Array
            let length = objInfo;
            let arrayOffset = 1;
            if (objInfo === 0xF) {
            const lo = getIntLengthOffset();
            length = lo.length;
            arrayOffset = lo.offset;
            }
            const array = [];
            for (let i = 0; i < length; i++) {
            const objRef = readUint(buf.slice(
                offset + arrayOffset + i * objectRefSize,
                offset + arrayOffset + (i + 1) * objectRefSize,
            ));
            array[i] = parseObject(objRef);
            }
            return array;
        }

        case 0xD: { // Dictionary
            let length = objInfo;
            let dictOffset = 1;
            if (objInfo === 0xF) {
            const lo = getIntLengthOffset();
            length = lo.length;
            dictOffset = lo.offset;
            }
            const dict: Record<string, unknown> = {};
            for (let i = 0; i < length; i++) {
            const keyRef = readUint(buf.slice(
                offset + dictOffset + i * objectRefSize,
                offset + dictOffset + (i + 1) * objectRefSize,
            ));
            const valRef = readUint(
                buf.slice(
                offset + dictOffset + (length * objectRefSize) +
                    i * objectRefSize,
                offset + dictOffset + (length * objectRefSize) +
                    (i + 1) * objectRefSize,
                ),
            );
            const key = parseObject(keyRef);
            const val = parseObject(valRef);
            dict[key as string] = val;
            }
            return dict;
        }

        default: {
            throw new Error("Unhandled type 0x" + objType.toString(16));
        }
        }
    };

    return parseObject(topObject);
}

function readBigUint64(buf: Uint8Array, start = 0) {
  // Dropping the first 4 bytes because js numbers aren't bigints
  const dv = new DataView(buf.buffer);
  const top = dv.getUint32(start);
  return {
    tooBig: top !== 0,
    val: dv.getUint32(start + 4),
  };
}

function readUint(buf: Uint8Array, start = 0) {
  let l = 0;
  for (let i = start; i < buf.length; i++) {
    l <<= 8;
    l |= buf[i] & 0xFF;
  }
  return l;
}

function readHexString(buf: Uint8Array) {
  let str = "";
  let i = 0;
  for (; i < buf.length; i++) {
    if (buf[i] !== 0x00) {
      break;
    }
  }
  for (; i < buf.length; i++) {
    const part = "00" + buf[i].toString(16);
    str += part.substring(part.length - 2);
  }
  return str;
}

function readFloat32(buf: Uint8Array, start = 0) {
  return new DataView(buf.buffer).getFloat32(start);
}

function readFloat64(buf: Uint8Array, start = 0) {
  return new DataView(buf.buffer).getFloat64(start);
}

function swapBytes(buf: Uint8Array) {
  for (let i = 0; i < buf.length; i += 2) {
    const a = buf[i];
    buf[i] = buf[i + 1];
    buf[i + 1] = a;
  }
  return buf;
}
